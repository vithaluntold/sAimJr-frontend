"""
AI Service Module for S(ai)m Jr Backend
Handles AI integrations and services
"""

import os
from typing import Dict, Any, Optional
import openai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure OpenAI
openai.api_key = os.getenv("OPENAI_API_KEY")

class AIService:
    """AI Service handler for various AI operations"""
    
    def __init__(self):
        self.client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    
    async def generate_chart_of_accounts(self, company_profile: Dict[str, Any]) -> Dict[str, Any]:
        """Generate AI-powered chart of accounts"""
        try:
            response = self.client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert accountant. Generate a comprehensive chart of accounts based on the company profile."
                    },
                    {
                        "role": "user",
                        "content": f"Generate a chart of accounts for: {company_profile}"
                    }
                ],
                max_tokens=2000
            )
            
            return {
                "success": True,
                "chart_of_accounts": response.choices[0].message.content
            }
        except Exception as e:
            return {
                "success": False, 
                "error": str(e)
            }
    
    async def categorize_transactions(self, transactions: list) -> Dict[str, Any]:
        """AI-powered transaction categorization"""
        try:
            # Implement transaction categorization logic
            return {
                "success": True,
                "categorized_transactions": transactions
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }

# Global AI service instance
_ai_service: Optional[AIService] = None

def get_ai_service() -> AIService:
    """Get the global AI service instance"""
    global _ai_service
    if _ai_service is None:
        _ai_service = AIService()
    return _ai_service