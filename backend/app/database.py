import sqlite3
import json
import logging
from datetime import datetime
from typing import Dict, Any, List, Optional
from contextlib import contextmanager
import os

logger = logging.getLogger(__name__)

class DecisionDatabase:
    """
    Database manager for storing and retrieving decision history.
    Uses SQLite for simplicity and portability.
    """
    
    def __init__(self, db_path: str = "decisions.db"):
        self.db_path = db_path
        self.init_database()
    
    def init_database(self):
        """Initialize the database with required tables."""
        try:
            with self.get_connection() as conn:
                conn.execute("""
                    CREATE TABLE IF NOT EXISTS decisions (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        task_description TEXT NOT NULL,
                        context TEXT,  -- JSON string
                        decision TEXT NOT NULL,
                        reasoning_steps TEXT,  -- JSON array
                        feature_importance TEXT,  -- JSON object
                        confidence_score REAL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        processing_time_ms INTEGER,
                        model_used TEXT,
                        success BOOLEAN DEFAULT 1
                    )
                """)
                
                conn.execute("""
                    CREATE TABLE IF NOT EXISTS decision_analytics (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        decision_id INTEGER,
                        metric_name TEXT NOT NULL,
                        metric_value REAL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (decision_id) REFERENCES decisions (id)
                    )
                """)
                
                conn.execute("""
                    CREATE INDEX IF NOT EXISTS idx_decisions_created_at 
                    ON decisions(created_at)
                """)
                
                conn.execute("""
                    CREATE INDEX IF NOT EXISTS idx_decisions_task_description 
                    ON decisions(task_description)
                """)
                
                logger.info("Database initialized successfully")
                
        except Exception as e:
            logger.error(f"Database initialization failed: {e}")
            raise
    
    @contextmanager
    def get_connection(self):
        """Get database connection with proper error handling."""
        conn = None
        try:
            conn = sqlite3.connect(self.db_path)
            conn.row_factory = sqlite3.Row  # Enable column access by name
            yield conn
            conn.commit()
        except Exception as e:
            if conn:
                conn.rollback()
            logger.error(f"Database operation failed: {e}")
            raise
        finally:
            if conn:
                conn.close()
    
    def save_decision(self, 
                     task_description: str,
                     context: Dict[str, Any],
                     decision: str,
                     explanation: Dict[str, Any],
                     processing_time_ms: int = 0,
                     model_used: str = "IntelligentAgent") -> int:
        """
        Save a decision and its explanation to the database.
        Returns the decision ID.
        """
        try:
            with self.get_connection() as conn:
                # Extract confidence score from reasoning steps
                confidence_score = self._extract_confidence_score(explanation.get("reasoning_steps", []))
                
                cursor = conn.execute("""
                    INSERT INTO decisions (
                        task_description, context, decision, reasoning_steps,
                        feature_importance, confidence_score, processing_time_ms,
                        model_used, success
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    task_description,
                    json.dumps(context),
                    decision,
                    json.dumps(explanation.get("reasoning_steps", [])),
                    json.dumps(explanation.get("feature_importance", {})),
                    confidence_score,
                    processing_time_ms,
                    model_used,
                    True
                ))
                
                decision_id = cursor.lastrowid
                
                # Store analytics metrics
                self._save_analytics_metrics(decision_id, context, explanation)
                
                logger.info(f"Decision saved with ID: {decision_id}")
                return decision_id
                
        except Exception as e:
            logger.error(f"Failed to save decision: {e}")
            raise
    
    def get_decision_history(self, limit: int = 50, offset: int = 0) -> List[Dict[str, Any]]:
        """Get recent decision history."""
        try:
            with self.get_connection() as conn:
                cursor = conn.execute("""
                    SELECT * FROM decisions 
                    ORDER BY created_at DESC 
                    LIMIT ? OFFSET ?
                """, (limit, offset))
                
                decisions = []
                for row in cursor.fetchall():
                    decision_dict = dict(row)
                    # Parse JSON fields
                    decision_dict['context'] = json.loads(decision_dict['context'] or '{}')
                    decision_dict['reasoning_steps'] = json.loads(decision_dict['reasoning_steps'] or '[]')
                    decision_dict['feature_importance'] = json.loads(decision_dict['feature_importance'] or '{}')
                    decisions.append(decision_dict)
                
                return decisions
                
        except Exception as e:
            logger.error(f"Failed to get decision history: {e}")
            return []
    
    def get_decision_analytics(self, days: int = 30) -> Dict[str, Any]:
        """Get analytics for decisions over the specified period."""
        try:
            with self.get_connection() as conn:
                # Total decisions
                total_cursor = conn.execute("""
                    SELECT COUNT(*) as total FROM decisions 
                    WHERE created_at >= datetime('now', '-{} days')
                """.format(days))
                total_decisions = total_cursor.fetchone()['total']
                
                # Average processing time
                avg_time_cursor = conn.execute("""
                    SELECT AVG(processing_time_ms) as avg_time FROM decisions 
                    WHERE created_at >= datetime('now', '-{} days')
                    AND processing_time_ms > 0
                """.format(days))
                avg_time_result = avg_time_cursor.fetchone()
                avg_processing_time = avg_time_result['avg_time'] or 0
                
                # Most common decision patterns
                patterns_cursor = conn.execute("""
                    SELECT 
                        SUBSTR(task_description, 1, 50) as task_pattern,
                        COUNT(*) as frequency
                    FROM decisions 
                    WHERE created_at >= datetime('now', '-{} days')
                    GROUP BY SUBSTR(task_description, 1, 50)
                    ORDER BY frequency DESC
                    LIMIT 10
                """.format(days))
                patterns = [dict(row) for row in patterns_cursor.fetchall()]
                
                # Confidence score distribution
                confidence_cursor = conn.execute("""
                    SELECT 
                        CASE 
                            WHEN confidence_score >= 0.8 THEN 'High (0.8+)'
                            WHEN confidence_score >= 0.6 THEN 'Medium (0.6-0.8)'
                            WHEN confidence_score >= 0.4 THEN 'Low (0.4-0.6)'
                            ELSE 'Very Low (<0.4)'
                        END as confidence_range,
                        COUNT(*) as count
                    FROM decisions 
                    WHERE created_at >= datetime('now', '-{} days')
                    AND confidence_score IS NOT NULL
                    GROUP BY confidence_range
                    ORDER BY count DESC
                """.format(days))
                confidence_dist = [dict(row) for row in confidence_cursor.fetchall()]
                
                return {
                    "total_decisions": total_decisions,
                    "avg_processing_time_ms": round(avg_processing_time, 2),
                    "common_patterns": patterns,
                    "confidence_distribution": confidence_dist,
                    "period_days": days
                }
                
        except Exception as e:
            logger.error(f"Failed to get analytics: {e}")
            return {"error": str(e)}
    
    def search_decisions(self, query: str, limit: int = 20) -> List[Dict[str, Any]]:
        """Search decisions by task description or decision content."""
        try:
            with self.get_connection() as conn:
                cursor = conn.execute("""
                    SELECT * FROM decisions 
                    WHERE task_description LIKE ? OR decision LIKE ?
                    ORDER BY created_at DESC 
                    LIMIT ?
                """, (f"%{query}%", f"%{query}%", limit))
                
                decisions = []
                for row in cursor.fetchall():
                    decision_dict = dict(row)
                    decision_dict['context'] = json.loads(decision_dict['context'] or '{}')
                    decision_dict['reasoning_steps'] = json.loads(decision_dict['reasoning_steps'] or '[]')
                    decision_dict['feature_importance'] = json.loads(decision_dict['feature_importance'] or '{}')
                    decisions.append(decision_dict)
                
                return decisions
                
        except Exception as e:
            logger.error(f"Failed to search decisions: {e}")
            return []
    
    def get_similar_decisions(self, task_description: str, limit: int = 5) -> List[Dict[str, Any]]:
        """Find similar past decisions using simple text matching."""
        try:
            # Extract key words from the task
            task_words = set(task_description.lower().split())
            common_words = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'}
            key_words = task_words - common_words
            
            if not key_words:
                return []
            
            # Build search query
            search_terms = list(key_words)[:5]  # Limit to top 5 words
            query_parts = [f"task_description LIKE '%{term}%'" for term in search_terms]
            where_clause = " OR ".join(query_parts)
            
            with self.get_connection() as conn:
                cursor = conn.execute(f"""
                    SELECT * FROM decisions 
                    WHERE {where_clause}
                    ORDER BY created_at DESC 
                    LIMIT ?
                """, (limit,))
                
                decisions = []
                for row in cursor.fetchall():
                    decision_dict = dict(row)
                    decision_dict['context'] = json.loads(decision_dict['context'] or '{}')
                    decision_dict['reasoning_steps'] = json.loads(decision_dict['reasoning_steps'] or '[]')
                    decision_dict['feature_importance'] = json.loads(decision_dict['feature_importance'] or '{}')
                    decisions.append(decision_dict)
                
                return decisions
                
        except Exception as e:
            logger.error(f"Failed to find similar decisions: {e}")
            return []
    
    def _extract_confidence_score(self, reasoning_steps: List[str]) -> Optional[float]:
        """Extract confidence score from reasoning steps."""
        try:
            for step in reasoning_steps:
                if 'confidence' in step.lower():
                    # Look for percentage patterns
                    import re
                    matches = re.findall(r'(\d+(?:\.\d+)?)\s*%', step)
                    if matches:
                        return float(matches[0]) / 100.0
                    
                    # Look for decimal patterns
                    matches = re.findall(r'(\d+(?:\.\d+)?)\s*confidence', step.lower())
                    if matches:
                        score = float(matches[0])
                        return score if score <= 1.0 else score / 100.0
            
            return None
        except:
            return None
    
    def _save_analytics_metrics(self, decision_id: int, context: Dict[str, Any], explanation: Dict[str, Any]):
        """Save additional analytics metrics."""
        try:
            with self.get_connection() as conn:
                metrics = []
                
                # Context richness
                metrics.append(("context_parameters", len(context)))
                
                # Reasoning depth
                metrics.append(("reasoning_steps", len(explanation.get("reasoning_steps", []))))
                
                # Feature importance entropy (measure of distribution)
                feature_importance = explanation.get("feature_importance", {})
                if feature_importance:
                    values = list(feature_importance.values())
                    if values:
                        # Simple entropy calculation
                        import math
                        entropy = -sum(v * math.log(v + 1e-10) for v in values if v > 0)
                        metrics.append(("feature_entropy", entropy))
                
                # Save all metrics
                for metric_name, metric_value in metrics:
                    conn.execute("""
                        INSERT INTO decision_analytics (decision_id, metric_name, metric_value)
                        VALUES (?, ?, ?)
                    """, (decision_id, metric_name, metric_value))
                        
        except Exception as e:
            logger.error(f"Failed to save analytics metrics: {e}")
    
    def cleanup_old_decisions(self, days_to_keep: int = 90):
        """Clean up old decisions to manage database size."""
        try:
            with self.get_connection() as conn:
                cursor = conn.execute("""
                    DELETE FROM decision_analytics 
                    WHERE decision_id IN (
                        SELECT id FROM decisions 
                        WHERE created_at < datetime('now', '-{} days')
                    )
                """.format(days_to_keep))
                
                cursor = conn.execute("""
                    DELETE FROM decisions 
                    WHERE created_at < datetime('now', '-{} days')
                """.format(days_to_keep))
                
                deleted_count = cursor.rowcount
                logger.info(f"Cleaned up {deleted_count} old decisions")
                return deleted_count
                
        except Exception as e:
            logger.error(f"Failed to cleanup old decisions: {e}")
            return 0


# Global database instance
db_instance = None

def get_database() -> DecisionDatabase:
    """Get or create the global database instance."""
    global db_instance
    if db_instance is None:
        db_path = os.getenv("DATABASE_PATH", "decisions.db")
        db_instance = DecisionDatabase(db_path)
    return db_instance 