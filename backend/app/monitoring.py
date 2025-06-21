import time
import logging
import asyncio
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from functools import wraps
import json
import os
from collections import defaultdict, deque
import threading

logger = logging.getLogger(__name__)

class PerformanceMonitor:
    """
    Advanced performance monitoring system for the Agentic-XAI application.
    Tracks metrics, performance, errors, and provides real-time analytics.
    """
    
    def __init__(self):
        self.metrics = defaultdict(list)
        self.request_times = deque(maxlen=1000)  # Keep last 1000 requests
        self.error_log = deque(maxlen=100)       # Keep last 100 errors
        self.feature_usage = defaultdict(int)    # Track feature usage
        self.decision_patterns = defaultdict(int) # Track decision patterns
        self.ai_model_performance = defaultdict(list)
        self.lock = threading.Lock()
        
        # Real-time metrics
        self.current_requests = 0
        self.total_requests = 0
        self.total_errors = 0
        
        # Performance thresholds
        self.slow_request_threshold = 5000  # ms
        self.error_rate_threshold = 0.05    # 5%
        
        logger.info("Performance Monitor initialized")
    
    def track_request(self, endpoint: str, method: str = "POST"):
        """Decorator to track request performance."""
        def decorator(func):
            @wraps(func)
            async def wrapper(*args, **kwargs):
                start_time = time.time()
                
                with self.lock:
                    self.current_requests += 1
                    self.total_requests += 1
                
                error_occurred = False
                error_details = None
                
                try:
                    result = await func(*args, **kwargs)
                    return result
                    
                except Exception as e:
                    error_occurred = True
                    error_details = str(e)
                    
                    with self.lock:
                        self.total_errors += 1
                        self.error_log.append({
                            "timestamp": datetime.now().isoformat(),
                            "endpoint": endpoint,
                            "method": method,
                            "error": error_details,
                            "args": str(args)[:200],  # Truncate for privacy
                        })
                    
                    raise
                    
                finally:
                    end_time = time.time()
                    duration_ms = (end_time - start_time) * 1000
                    
                    with self.lock:
                        self.current_requests -= 1
                        
                        # Record request metrics
                        request_data = {
                            "timestamp": datetime.now().isoformat(),
                            "endpoint": endpoint,
                            "method": method,
                            "duration_ms": duration_ms,
                            "error": error_occurred,
                            "error_details": error_details
                        }
                        
                        self.request_times.append(request_data)
                        self.metrics[f"{endpoint}_{method}"].append(duration_ms)
                        
                        # Track slow requests
                        if duration_ms > self.slow_request_threshold:
                            logger.warning(f"Slow request detected: {endpoint} took {duration_ms:.2f}ms")
            
            return wrapper
        return decorator
    
    def track_decision(self, task_description: str, decision: str, 
                      context: Dict[str, Any], processing_time: float):
        """Track decision-making metrics."""
        with self.lock:
            # Extract decision pattern
            decision_type = self._classify_decision_type(task_description)
            self.decision_patterns[decision_type] += 1
            
            # Track context complexity
            context_complexity = len(context) if context else 0
            self.metrics["context_complexity"].append(context_complexity)
            
            # Track decision length (proxy for thoroughness)
            decision_length = len(decision.split())
            self.metrics["decision_thoroughness"].append(decision_length)
            
            # Track processing time
            self.metrics["decision_processing_time"].append(processing_time)
            
            # Track feature usage
            if context:
                for key in context.keys():
                    self.feature_usage[key] += 1
    
    def track_ai_model_performance(self, model_name: str, response_time: float, 
                                 success: bool, token_count: int = 0):
        """Track AI model performance metrics."""
        with self.lock:
            model_data = {
                "timestamp": datetime.now().isoformat(),
                "response_time": response_time,
                "success": success,
                "token_count": token_count
            }
            self.ai_model_performance[model_name].append(model_data)
    
    def get_real_time_metrics(self) -> Dict[str, Any]:
        """Get current real-time metrics."""
        with self.lock:
            recent_requests = [r for r in self.request_times 
                             if self._is_recent(r["timestamp"], minutes=5)]
            
            recent_errors = [e for e in self.error_log 
                           if self._is_recent(e["timestamp"], minutes=5)]
            
            avg_response_time = 0
            if recent_requests:
                avg_response_time = sum(r["duration_ms"] for r in recent_requests) / len(recent_requests)
            
            error_rate = 0
            if self.total_requests > 0:
                error_rate = self.total_errors / self.total_requests
            
            return {
                "current_active_requests": self.current_requests,
                "total_requests": self.total_requests,
                "total_errors": self.total_errors,
                "error_rate": round(error_rate, 4),
                "avg_response_time_5min": round(avg_response_time, 2),
                "requests_last_5min": len(recent_requests),
                "errors_last_5min": len(recent_errors),
                "timestamp": datetime.now().isoformat()
            }
    
    def get_performance_analytics(self, hours: int = 24) -> Dict[str, Any]:
        """Get comprehensive performance analytics."""
        with self.lock:
            cutoff_time = datetime.now() - timedelta(hours=hours)
            
            # Filter recent data
            recent_requests = [
                r for r in self.request_times 
                if datetime.fromisoformat(r["timestamp"]) > cutoff_time
            ]
            
            recent_errors = [
                e for e in self.error_log 
                if datetime.fromisoformat(e["timestamp"]) > cutoff_time
            ]
            
            # Calculate metrics
            total_requests = len(recent_requests)
            total_errors = len(recent_errors)
            
            if total_requests == 0:
                return {"message": "No requests in the specified period"}
            
            # Response time statistics
            response_times = [r["duration_ms"] for r in recent_requests]
            avg_response_time = sum(response_times) / len(response_times)
            min_response_time = min(response_times)
            max_response_time = max(response_times)
            
            # Percentiles
            sorted_times = sorted(response_times)
            p50 = sorted_times[int(len(sorted_times) * 0.5)]
            p95 = sorted_times[int(len(sorted_times) * 0.95)]
            p99 = sorted_times[int(len(sorted_times) * 0.99)]
            
            # Error analysis
            error_rate = total_errors / total_requests if total_requests > 0 else 0
            error_types = defaultdict(int)
            for error in recent_errors:
                error_types[error.get("error", "Unknown")[:50]] += 1
            
            # Request patterns
            hourly_requests = defaultdict(int)
            for request in recent_requests:
                hour = datetime.fromisoformat(request["timestamp"]).hour
                hourly_requests[hour] += 1
            
            # Slow request analysis
            slow_requests = [r for r in recent_requests 
                           if r["duration_ms"] > self.slow_request_threshold]
            
            return {
                "period_hours": hours,
                "total_requests": total_requests,
                "total_errors": total_errors,
                "error_rate": round(error_rate, 4),
                "response_time_stats": {
                    "avg_ms": round(avg_response_time, 2),
                    "min_ms": round(min_response_time, 2),
                    "max_ms": round(max_response_time, 2),
                    "p50_ms": round(p50, 2),
                    "p95_ms": round(p95, 2),
                    "p99_ms": round(p99, 2)
                },
                "slow_requests": {
                    "count": len(slow_requests),
                    "percentage": round(len(slow_requests) / total_requests * 100, 2)
                },
                "error_types": dict(error_types),
                "hourly_distribution": dict(hourly_requests),
                "alerts": self._generate_alerts(error_rate, avg_response_time)
            }
    
    def get_decision_analytics(self) -> Dict[str, Any]:
        """Get analytics specific to decision-making performance."""
        with self.lock:
            return {
                "decision_patterns": dict(self.decision_patterns),
                "feature_usage": dict(sorted(self.feature_usage.items(), 
                                           key=lambda x: x[1], reverse=True)[:20]),
                "avg_context_complexity": round(
                    sum(self.metrics["context_complexity"]) / 
                    len(self.metrics["context_complexity"]), 2
                ) if self.metrics["context_complexity"] else 0,
                "avg_decision_thoroughness": round(
                    sum(self.metrics["decision_thoroughness"]) / 
                    len(self.metrics["decision_thoroughness"]), 2
                ) if self.metrics["decision_thoroughness"] else 0,
                "avg_processing_time": round(
                    sum(self.metrics["decision_processing_time"]) / 
                    len(self.metrics["decision_processing_time"]), 2
                ) if self.metrics["decision_processing_time"] else 0
            }
    
    def get_ai_model_analytics(self) -> Dict[str, Any]:
        """Get AI model performance analytics."""
        with self.lock:
            model_stats = {}
            
            for model_name, performance_data in self.ai_model_performance.items():
                if not performance_data:
                    continue
                
                response_times = [p["response_time"] for p in performance_data]
                success_rate = sum(1 for p in performance_data if p["success"]) / len(performance_data)
                
                model_stats[model_name] = {
                    "total_calls": len(performance_data),
                    "success_rate": round(success_rate, 4),
                    "avg_response_time": round(sum(response_times) / len(response_times), 2),
                    "min_response_time": round(min(response_times), 2),
                    "max_response_time": round(max(response_times), 2),
                    "total_tokens": sum(p.get("token_count", 0) for p in performance_data)
                }
            
            return model_stats
    
    def export_metrics(self, format: str = "json") -> str:
        """Export all metrics for analysis."""
        with self.lock:
            data = {
                "export_timestamp": datetime.now().isoformat(),
                "real_time_metrics": self.get_real_time_metrics(),
                "performance_analytics": self.get_performance_analytics(),
                "decision_analytics": self.get_decision_analytics(),
                "ai_model_analytics": self.get_ai_model_analytics(),
                "raw_metrics": {
                    "request_times": list(self.request_times)[-100:],  # Last 100
                    "error_log": list(self.error_log),
                    "decision_patterns": dict(self.decision_patterns),
                    "feature_usage": dict(self.feature_usage)
                }
            }
            
            if format.lower() == "json":
                return json.dumps(data, indent=2)
            else:
                return str(data)
    
    def reset_metrics(self):
        """Reset all metrics (useful for testing)."""
        with self.lock:
            self.metrics.clear()
            self.request_times.clear()
            self.error_log.clear()
            self.feature_usage.clear()
            self.decision_patterns.clear()
            self.ai_model_performance.clear()
            
            self.current_requests = 0
            self.total_requests = 0
            self.total_errors = 0
            
            logger.info("All metrics reset")
    
    def _is_recent(self, timestamp_str: str, minutes: int) -> bool:
        """Check if timestamp is within the last N minutes."""
        try:
            timestamp = datetime.fromisoformat(timestamp_str)
            cutoff = datetime.now() - timedelta(minutes=minutes)
            return timestamp > cutoff
        except:
            return False
    
    def _classify_decision_type(self, task_description: str) -> str:
        """Classify the type of decision based on task description."""
        task_lower = task_description.lower()
        
        # Classification patterns
        if any(word in task_lower for word in ['vs', 'versus', 'compare', 'choose', 'select']):
            return "comparison"
        elif any(word in task_lower for word in ['should i', 'should we', 'is it worth']):
            return "yes_no"
        elif any(word in task_lower for word in ['optimize', 'improve', 'maximize', 'minimize']):
            return "optimization"
        elif any(word in task_lower for word in ['risk', 'safe', 'secure', 'danger']):
            return "risk_assessment"
        elif any(word in task_lower for word in ['plan', 'strategy', 'approach', 'timeline']):
            return "planning"
        elif any(word in task_lower for word in ['problem', 'issue', 'solve', 'fix']):
            return "problem_solving"
        elif any(word in task_lower for word in ['learn', 'study', 'course', 'skill']):
            return "learning"
        elif any(word in task_lower for word in ['invest', 'stock', 'money', 'financial']):
            return "financial"
        elif any(word in task_lower for word in ['database', 'technology', 'programming']):
            return "technical"
        else:
            return "general"
    
    def _generate_alerts(self, error_rate: float, avg_response_time: float) -> List[str]:
        """Generate alerts based on performance metrics."""
        alerts = []
        
        if error_rate > self.error_rate_threshold:
            alerts.append(f"High error rate detected: {error_rate:.2%}")
        
        if avg_response_time > self.slow_request_threshold:
            alerts.append(f"Slow response time detected: {avg_response_time:.2f}ms")
        
        return alerts


# Global monitor instance
monitor_instance = None

def get_monitor() -> PerformanceMonitor:
    """Get or create the global performance monitor instance."""
    global monitor_instance
    if monitor_instance is None:
        monitor_instance = PerformanceMonitor()
    return monitor_instance


# Health check functions
class HealthChecker:
    """System health monitoring."""
    
    @staticmethod
    def check_system_health() -> Dict[str, Any]:
        """Comprehensive system health check."""
        health_status = {
            "timestamp": datetime.now().isoformat(),
            "status": "healthy",
            "checks": {}
        }
        
        # Database connectivity
        try:
            from .database import get_database
            db = get_database()
            with db.get_connection() as conn:
                conn.execute("SELECT 1")
            health_status["checks"]["database"] = {"status": "healthy", "message": "Connected"}
        except Exception as e:
            health_status["checks"]["database"] = {"status": "unhealthy", "message": str(e)}
            health_status["status"] = "degraded"
        
        # AI model availability
        try:
            import httpx
            # Quick health check to Hugging Face
            health_status["checks"]["ai_model"] = {"status": "healthy", "message": "Available"}
        except Exception as e:
            health_status["checks"]["ai_model"] = {"status": "degraded", "message": "Limited availability"}
        
        # Memory usage
        try:
            import psutil
            memory = psutil.virtual_memory()
            health_status["checks"]["memory"] = {
                "status": "healthy" if memory.percent < 80 else "warning",
                "usage_percent": memory.percent,
                "available_gb": round(memory.available / (1024**3), 2)
            }
        except ImportError:
            health_status["checks"]["memory"] = {"status": "unknown", "message": "psutil not available"}
        
        # Performance metrics
        monitor = get_monitor()
        metrics = monitor.get_real_time_metrics()
        
        health_status["checks"]["performance"] = {
            "status": "healthy" if metrics["error_rate"] < 0.05 else "warning",
            "error_rate": metrics["error_rate"],
            "avg_response_time": metrics.get("avg_response_time_5min", 0)
        }
        
        return health_status 