from typing import List, Dict, Any

class QuizService:
    BANK = {
        "Normalization": [
            {
                "id": 1,
                "question": "Which normal form requires eliminating partial functional dependencies on a composite primary key?",
                "options": ["1NF", "2NF", "3NF", "BCNF"],
                "correctAnswer": 1,
                "explanation": "Second Normal Form (2NF) enforces that every non-prime attribute must be fully functionally dependent on the candidate key."
            },
            {
                "id": 2,
                "question": "A relation is in 3NF if it is in 2NF and has no:",
                "options": ["Multivalued dependencies", "Transitive dependencies", "Partial dependencies", "Trivial functional dependencies"],
                "correctAnswer": 1,
                "explanation": "3NF requires that non-prime attributes are not transitively dependent on the primary key."
            },
            {
                "id": 3,
                "question": "In BCNF, for every functional dependency X -> Y, X must be a:",
                "options": ["Super Key / Candidate Key", "Foreign Key", "Prime Attribute", "Non-prime Attribute"],
                "correctAnswer": 0,
                "explanation": "BCNF requires every determinant X to be a super key."
            },
            {
                "id": 4,
                "question": "Which anomaly occurs when deleting one piece of data inadvertently deletes unrelated required information?",
                "options": ["Update Anomaly", "Insertion Anomaly", "Deletion Anomaly", "Read Anomaly"],
                "correctAnswer": 2,
                "explanation": "Deletion anomalies happen when unnormalized tables force deletion of unrelated critical entities."
            }
        ],
        "Transactions": [
            {
                "id": 1,
                "question": "Which ACID property guarantees that all operations in a transaction are completed or none are?",
                "options": ["Atomicity", "Consistency", "Isolation", "Durability"],
                "correctAnswer": 0,
                "explanation": "Atomicity ensures 'all-or-nothing' execution."
            },
            {
                "id": 2,
                "question": "A precedence graph is used to test for which type of serializability?",
                "options": ["View Serializability", "Conflict Serializability", "Recoverability", "Cascadelessness"],
                "correctAnswer": 1,
                "explanation": "A cycle in a precedence graph means the schedule is not conflict serializable."
            },
            {
                "id": 3,
                "question": "Two-Phase Locking (2PL) protocol guarantees:",
                "options": ["Deadlock freedom", "Conflict Serializability", "No starvation", "Zero latency"],
                "correctAnswer": 1,
                "explanation": "2PL guarantees conflict serializability."
            },
            {
                "id": 4,
                "question": "Which isolation level prevents Dirty Reads but still allows Non-repeatable Reads?",
                "options": ["Read Uncommitted", "Read Committed", "Repeatable Read", "Serializable"],
                "correctAnswer": 1,
                "explanation": "Read Committed only allows reading data committed by other transactions."
            }
        ],
        "General": [
            {
                "id": 1,
                "question": "What is the primary benefit of modular code architecture?",
                "options": ["Higher memory usage", "Separation of concerns & maintainability", "Faster network latency", "Elimination of databases"],
                "correctAnswer": 1,
                "explanation": "Modular architecture separates system concerns into testable, maintainable units."
            },
            {
                "id": 2,
                "question": "Which data structure follows First-In, First-Out (FIFO) semantics?",
                "options": ["Stack", "Queue", "Heap", "Binary Tree"],
                "correctAnswer": 1,
                "explanation": "A Queue processes elements in arrival order (FIFO)."
            }
        ]
    }

    @classmethod
    def generate_quiz(cls, subject: str, topic: str, difficulty: str = "Medium", count: int = 4) -> List[Dict[str, Any]]:
        for key in cls.BANK:
            if key.lower() in topic.lower():
                return cls.BANK[key][:count]
        return cls.BANK["General"][:count]

quiz_service = QuizService()
