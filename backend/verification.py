import hashlib
from datetime import datetime, timedelta
from db import db
import re
from typing import Dict, List, Tuple, Optional
import json
from collections import defaultdict
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler

class FraudDetector:
    def __init__(self):
        self.risk_threshold = 0.7  # Risk score threshold for fraud detection
        self.price_change_threshold = 0.5  # 50% price change threshold
        self.rapid_update_threshold = timedelta(minutes=5)
        self.max_updates_per_hour = 5
        self.suspicious_patterns = {
            'location': [
                r'\d{10}',  # Phone numbers
                r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+',  # URLs
                r'[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}',  # Email addresses
                r'(?i)(free|cheap|discount|offer|deal|sale)',  # Suspicious keywords
                r'(?i)(urgent|quick|fast|immediate)',  # Urgency indicators
            ],
            'terms': [
                r'(?i)(wire transfer|western union|money order)',  # Suspicious payment methods
                r'(?i)(guarantee|warranty|refund)',  # Suspicious guarantees
                r'(?i)(confidential|secret|private)',  # Suspicious confidentiality
            ]
        }
        self.required_fields = ['location', 'buyer_intent', 'terms']
        self.field_weights = {
            'price_change': 0.3,
            'update_frequency': 0.2,
            'pattern_match': 0.2,
            'data_consistency': 0.15,
            'user_behavior': 0.15
        }
        self.model = IsolationForest(contamination=0.1, random_state=42)
        self.scaler = StandardScaler()
        self.is_model_trained = False

    def prepare_features(self, changes: dict, user: dict, prev_log: Optional[dict]) -> np.ndarray:
        """Prepare features for the machine learning model"""
        features = []
        
        # Price change features
        if 'price' in changes and prev_log and 'price' in prev_log['changes']:
            old_price = float(prev_log['changes']['price'])
            new_price = float(changes['price'])
            price_change = abs((new_price - old_price) / old_price)
            features.extend([price_change, new_price])
        else:
            features.extend([0, 0])

        # Update frequency features
        if prev_log:
            time_diff = (datetime.utcnow() - prev_log['timestamp']).total_seconds()
            features.append(time_diff)
        else:
            features.append(0)

        # User activity features
        user_logs = list(db.audit_logs.find(
            {'user.id': user['id']},
            sort=[('timestamp', -1)],
            limit=20
        ))
        features.append(len(user_logs))
        
        # Property count feature
        property_count = len(set(log['property_id'] for log in user_logs))
        features.append(property_count)

        # Content length features
        features.append(len(changes.get('location', '')))
        features.append(len(changes.get('terms', '')))
        features.append(len(changes.get('buyer_intent', '')))

        # Pattern match count
        pattern_matches = 0
        for field, patterns in self.suspicious_patterns.items():
            if field in changes:
                value = str(changes[field]).lower()
                for pattern in patterns:
                    if re.search(pattern, value):
                        pattern_matches += 1
        features.append(pattern_matches)

        return np.array(features).reshape(1, -1)

    def train_model(self):
        """Train the isolation forest model with historical data"""
        # Fetch historical data
        historical_logs = list(db.audit_logs.find(
            {},
            sort=[('timestamp', -1)],
            limit=1000
        ))

        if not historical_logs:
            return

        # Prepare training data
        X = []
        for log in historical_logs:
            features = self.prepare_features(
                log['changes'],
                log['user'],
                db.audit_logs.find_one(
                    {'property_id': log['property_id'], 'timestamp': {'$lt': log['timestamp']}},
                    sort=[('timestamp', -1)]
                )
            )
            X.append(features[0])

        X = np.array(X)
        
        # Scale features
        X_scaled = self.scaler.fit_transform(X)
        
        # Train model
        self.model.fit(X_scaled)
        self.is_model_trained = True

    def predict_anomaly(self, features: np.ndarray) -> float:
        """Predict anomaly score using the trained model"""
        if not self.is_model_trained:
            self.train_model()
        
        # Scale features
        features_scaled = self.scaler.transform(features)
        
        # Get anomaly score (negative values indicate anomalies)
        score = self.model.score_samples(features_scaled)[0]
        
        # Convert to probability (0 to 1, where 1 is more anomalous)
        probability = 1 / (1 + np.exp(score))
        return probability

    def calculate_risk_score(self, risk_factors: Dict[str, float]) -> float:
        """Calculate weighted risk score based on various factors"""
        return sum(score * self.field_weights.get(factor, 0) 
                  for factor, score in risk_factors.items())

    def check_price_anomaly(self, changes: dict, prev_log: Optional[dict]) -> Tuple[float, str]:
        """Check for suspicious price changes with market context"""
        if 'price' not in changes or not prev_log or 'price' not in prev_log['changes']:
            return 0.0, None

        old_price = float(prev_log['changes']['price'])
        new_price = float(changes['price'])
        price_change_percent = abs((new_price - old_price) / old_price)

        # Get market context
        recent_prices = list(db.properties.find(
            {'location': changes.get('location')},
            {'price': 1, '_id': 0}
        ).limit(10))
        
        if recent_prices:
            avg_price = sum(float(p['price']) for p in recent_prices) / len(recent_prices)
            market_deviation = abs(new_price - avg_price) / avg_price
            
            if market_deviation > 0.3:  # 30% deviation from market average
                return 0.8, f"Price significantly deviates from market average ({market_deviation:.1%})"
        
        if price_change_percent > self.price_change_threshold:
            return 0.7, f"Suspicious price change: {price_change_percent:.1%}"
        
        return 0.0, None

    def check_update_frequency(self, user: dict, prev_log: Optional[dict]) -> Tuple[float, str]:
        """Check for suspicious update patterns"""
        if not prev_log:
            return 0.0, None

        time_diff = datetime.utcnow() - prev_log['timestamp']
        if time_diff < self.rapid_update_threshold:
            return 0.6, "Multiple rapid updates detected"

        # Check user's update history
        recent_updates = list(db.audit_logs.find(
            {'user.id': user['id']},
            sort=[('timestamp', -1)],
            limit=20
        ))

        if len(recent_updates) >= self.max_updates_per_hour:
            return 0.8, "Unusually high update frequency"
        
        # Check for update pattern anomalies
        update_times = [log['timestamp'] for log in recent_updates]
        if len(update_times) >= 3:
            time_diffs = [(update_times[i] - update_times[i+1]).total_seconds() 
                         for i in range(len(update_times)-1)]
            if all(diff < 60 for diff in time_diffs):  # Updates within 1 minute
                return 0.9, "Suspicious update pattern detected"

        return 0.0, None

    def check_patterns(self, changes: dict) -> Tuple[float, str]:
        """Check for suspicious patterns in property data"""
        risk_score = 0.0
        reasons = []

        for field, patterns in self.suspicious_patterns.items():
            if field in changes:
                value = str(changes[field]).lower()
                for pattern in patterns:
                    if re.search(pattern, value):
                        risk_score = max(risk_score, 0.7)
                        reasons.append(f"Suspicious pattern in {field}")

        return risk_score, '; '.join(reasons) if reasons else None

    def check_data_consistency(self, changes: dict) -> Tuple[float, str]:
        """Check for data consistency and completeness"""
        risk_score = 0.0
        reasons = []

        # Check required fields
        missing_fields = [field for field in self.required_fields if field not in changes]
        if missing_fields:
            risk_score = max(risk_score, 0.6)
            reasons.append(f"Missing required fields: {', '.join(missing_fields)}")

        # Check field lengths and formats
        if 'terms' in changes:
            terms = changes['terms']
            if len(terms) < 10:
                risk_score = max(risk_score, 0.5)
                reasons.append("Suspiciously short terms")
            if len(terms) > 1000:
                risk_score = max(risk_score, 0.5)
                reasons.append("Suspiciously long terms")

        if 'location' in changes:
            location = changes['location']
            if len(location) < 5 or len(location) > 200:
                risk_score = max(risk_score, 0.5)
                reasons.append("Suspicious location length")

        return risk_score, '; '.join(reasons) if reasons else None

    def check_user_behavior(self, user: dict) -> Tuple[float, str]:
        """Analyze user behavior patterns"""
        risk_score = 0.0
        reasons = []

        # Check user's history
        user_logs = list(db.audit_logs.find(
            {'user.id': user['id']},
            sort=[('timestamp', -1)],
            limit=50
        ))

        if user_logs:
            # Check for multiple properties
            property_count = len(set(log['property_id'] for log in user_logs))
            if property_count > 5:
                risk_score = max(risk_score, 0.6)
                reasons.append("User managing multiple properties")

            # Check for suspicious timing patterns
            update_times = [log['timestamp'] for log in user_logs]
            if len(update_times) >= 3:
                time_diffs = [(update_times[i] - update_times[i+1]).total_seconds() 
                             for i in range(len(update_times)-1)]
                if all(diff < 300 for diff in time_diffs):  # Updates within 5 minutes
                    risk_score = max(risk_score, 0.8)
                    reasons.append("Suspicious update timing pattern")

        return risk_score, '; '.join(reasons) if reasons else None

    def detect_fraud(self, changes: dict, user: dict, prev_log: Optional[dict]) -> Tuple[bool, str]:
        """Enhanced fraud detection with machine learning and risk scoring"""
        risk_factors = {}
        all_reasons = []

        # Prepare features for ML model
        features = self.prepare_features(changes, user, prev_log)
        ml_score = self.predict_anomaly(features)
        if ml_score > 0.7:  # High anomaly score
            risk_factors['ml_detection'] = ml_score
            all_reasons.append(f"Machine learning anomaly detection score: {ml_score:.2f}")

        # Check price anomalies
        score, reason = self.check_price_anomaly(changes, prev_log)
        if score > 0:
            risk_factors['price_change'] = score
            if reason:
                all_reasons.append(reason)

        # Check update frequency
        score, reason = self.check_update_frequency(user, prev_log)
        if score > 0:
            risk_factors['update_frequency'] = score
            if reason:
                all_reasons.append(reason)

        # Check patterns
        score, reason = self.check_patterns(changes)
        if score > 0:
            risk_factors['pattern_match'] = score
            if reason:
                all_reasons.append(reason)

        # Check data consistency
        score, reason = self.check_data_consistency(changes)
        if score > 0:
            risk_factors['data_consistency'] = score
            if reason:
                all_reasons.append(reason)

        # Check user behavior
        score, reason = self.check_user_behavior(user)
        if score > 0:
            risk_factors['user_behavior'] = score
            if reason:
                all_reasons.append(reason)

        # Calculate final risk score
        final_score = self.calculate_risk_score(risk_factors)
        
        # Log risk assessment
        risk_assessment = {
            'timestamp': datetime.utcnow(),
            'user_id': user['id'],
            'risk_score': final_score,
            'ml_score': ml_score,
            'risk_factors': risk_factors,
            'reasons': all_reasons
        }
        db.risk_assessments.insert_one(risk_assessment)

        return final_score > self.risk_threshold, '; '.join(all_reasons) if all_reasons else None

# Initialize fraud detector
fraud_detector = FraudDetector()

def hash_property_data(property_data: dict, prev_hash: str = None) -> str:
    # Include prev_hash in the data to be hashed for chaining
    data = property_data.copy()
    if prev_hash:
        data['prev_hash'] = prev_hash
    data_str = str(sorted(data.items()))
    return hashlib.sha256(data_str.encode()).hexdigest()

def log_audit(property_id: str, action: str, changes: dict, user: dict):
    # Fetch the latest audit log for this property to get the previous hash
    prev_log = db.audit_logs.find_one({'property_id': property_id}, sort=[('timestamp', -1)])
    prev_hash = prev_log['hash'] if prev_log else None
    hash_val = hash_property_data(changes, prev_hash)
    
    # Check for fraud before logging
    fraud_detected, fraud_reason = fraud_detector.detect_fraud(changes, user, prev_log)
    
    log_entry = {
        'property_id': property_id,
        'action': action,
        'hash': hash_val,
        'prev_hash': prev_hash,
        'timestamp': datetime.utcnow(),
        'changes': changes,
        'user': user,
        'fraud_detected': fraud_detected,
        'fraud_reason': fraud_reason
    }
    db.audit_logs.insert_one(log_entry)
    return log_entry

def detect_fraud(property_data: dict) -> bool:
    # TODO: Implement with TensorFlow
    # For now, always return False (not fraudulent)
    return False 