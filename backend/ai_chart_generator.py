#!/usr/bin/env python3
"""
AI Chart Generator - OpenAI Integration for Accounting System
Provides AI-driven Chart of Accounts generation and transaction categorization
"""

import os
import json
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime
from openai import OpenAI  # type: ignore[import-untyped]
import asyncio

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class AIChartGenerator:
    """AI-powered Chart of Accounts generator and transaction categorizer"""
    
    def __init__(self):
        self.openai_client = OpenAI(
            api_key=os.getenv("OPENAI_API_KEY", "your-openai-api-key")
        )
        self.model = "gpt-4"
        self.max_tokens = 4000
    
    def generate_ai_chart_of_accounts(
        self, 
        company_name: str,
        nature_of_business: str,
        industry: str,
        location: str,
        company_type: str,
        reporting_framework: str,
        statutory_compliances: List[str]
    ) -> Dict[str, Any]:
        """
        Generate comprehensive Chart of Accounts using 5-step AI workflow
        """
        try:
            company_profile = {
                "company_name": company_name,
                "nature_of_business": nature_of_business,
                "industry": industry,
                "location": location,
                "company_type": company_type,
                "reporting_framework": reporting_framework,
                "statutory_compliances": statutory_compliances
            }
            
            # Step 1: Determine required financial statements
            statements = self._determine_statements(company_profile)
            
            # Step 2: Define high-level classes
            classes = self._define_classes(statements, company_profile)
            
            # Step 3: Build classification structure
            classifications = self._build_classifications(classes, company_profile)
            
            # Step 4: Add subclassifications
            subclassifications = self._add_subclassifications(classifications, company_profile)
            
            # Step 5: Generate complete chart of accounts
            chart_of_accounts = self._generate_complete_coa(subclassifications, company_profile)
            
            return {
                "status": "success",
                "company_profile": company_profile,
                "workflow_steps": {
                    "statements": statements,
                    "classes": classes,
                    "classifications": classifications,
                    "subclassifications": subclassifications
                },
                "chart_of_accounts": chart_of_accounts,
                "metadata": {
                    "total_accounts": self._count_accounts(chart_of_accounts),
                    "generated_at": datetime.utcnow().isoformat(),
                    "ai_model": self.model,
                    "generation_method": "5_step_ai_workflow"
                }
            }
            
        except Exception as e:
            logger.error(f"AI COA generation failed: {str(e)}")
            # Create fallback company profile if not already defined
            fallback_profile = {
                "company_name": company_name,
                "nature_of_business": nature_of_business,
                "industry": industry,
                "location": location,
                "company_type": company_type,
                "reporting_framework": reporting_framework,
                "statutory_compliances": statutory_compliances
            }
            return self._generate_fallback_coa(fallback_profile)
    
    def _determine_statements(self, company_profile: Dict) -> Dict:
        """Step 1: AI determines required financial statements"""
        
        prompt = f"""
        Based on this company profile: {json.dumps(company_profile, indent=2)}
        
        Determine the financial statements needed for this company.
        Consider the industry, company type, and reporting framework.
        
        Common options include:
        - Statement of Profit and Loss
        - Balance Sheet / Statement of Financial Position
        - Statement of Financial Performance
        - Cash Flow Statement
        - Statement of Changes in Equity
        
        Return ONLY a JSON object with the required statements as keys.
        Example:
        {{
            "statementOfProfitAndLoss": {{}},
            "statementOfFinancialPosition": {{}}
        }}
        """
        
        try:
            response = self.openai_client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                response_format={"type": "json_object"},
                max_tokens=1000
            )
            
            return json.loads(response.choices[0].message.content)
            
        except Exception as e:
            logger.error(f"Statement determination failed: {str(e)}")
            return {
                "statementOfProfitAndLoss": {},
                "statementOfFinancialPosition": {}
            }
    
    def _define_classes(self, statements: Dict, company_profile: Dict) -> Dict:
        """Step 2: AI defines high-level classes for each statement"""
        
        prompt = f"""
        Company Profile: {json.dumps(company_profile, indent=2)}
        Required Statements: {json.dumps(statements, indent=2)}
        
        For each financial statement, define the appropriate high-level classes.
        
        For Balance Sheet/Statement of Financial Position, typical classes are:
        - Assets
        - Equity and Liabilities
        
        For Profit and Loss/Statement of Financial Performance, typical classes are:
        - Revenue/Income
        - Expenses
        
        Return ONLY a JSON object with classes for each statement.
        Example:
        {{
            "statementOfProfitAndLoss": [
                {{"class": "Revenue"}},
                {{"class": "Expenses"}}
            ],
            "statementOfFinancialPosition": [
                {{"class": "Assets"}},
                {{"class": "Equity and Liabilities"}}
            ]
        }}
        """
        
        try:
            response = self.openai_client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                response_format={"type": "json_object"},
                max_tokens=1500
            )
            
            return json.loads(response.choices[0].message.content)
            
        except Exception as e:
            logger.error(f"Class definition failed: {str(e)}")
            return {
                "statementOfProfitAndLoss": [
                    {"class": "Revenue"},
                    {"class": "Expenses"}
                ],
                "statementOfFinancialPosition": [
                    {"class": "Assets"},
                    {"class": "Equity and Liabilities"}
                ]
            }
    
    def _build_classifications(self, classes: Dict, company_profile: Dict) -> Dict:
        """Step 3: AI builds classification structure within classes"""
        
        prompt = f"""
        Company Profile: {json.dumps(company_profile, indent=2)}
        Class Structure: {json.dumps(classes, indent=2)}
        
        For each class, add appropriate classifications.
        
        Examples:
        - Assets: Current Assets, Non-Current Assets
        - Equity and Liabilities: Equity, Current Liabilities, Non-Current Liabilities
        - Revenue: Operating Revenue, Non-Operating Revenue
        - Expenses: Operating Expenses, Non-Operating Expenses
        
        Return ONLY a JSON object with classifications added to each class.
        Example:
        {{
            "statementOfProfitAndLoss": [
                {{
                    "class": "Revenue",
                    "classification": "Operating Revenue"
                }},
                {{
                    "class": "Revenue",
                    "classification": "Non-Operating Revenue"
                }},
                {{
                    "class": "Expenses",
                    "classification": "Operating Expenses"
                }}
            ],
            "statementOfFinancialPosition": [
                {{
                    "class": "Assets",
                    "classification": "Current Assets"
                }},
                {{
                    "class": "Assets",
                    "classification": "Non-Current Assets"
                }},
                {{
                    "class": "Equity and Liabilities",
                    "classification": "Equity"
                }},
                {{
                    "class": "Equity and Liabilities",
                    "classification": "Current Liabilities"
                }}
            ]
        }}
        """
        
        try:
            response = self.openai_client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                response_format={"type": "json_object"},
                max_tokens=2000
            )
            
            return json.loads(response.choices[0].message.content)
            
        except Exception as e:
            logger.error(f"Classification building failed: {str(e)}")
            return self._get_fallback_classifications()
    
    def _add_subclassifications(self, classifications: Dict, company_profile: Dict) -> Dict:
        """Step 4: AI adds subclassifications within classifications"""
        
        prompt = f"""
        Company Profile: {json.dumps(company_profile, indent=2)}
        Classification Structure: {json.dumps(classifications, indent=2)}
        
        For each classification, add detailed subclassifications relevant to the company's industry and type.
        
        Examples:
        - Current Assets: Cash and Cash Equivalents, Trade Receivables, Inventory
        - Operating Expenses: Cost of Goods Sold, Selling Expenses, Administrative Expenses
        - Equity: Share Capital, Retained Earnings, Other Equity
        
        Consider the specific industry ({company_profile['industry']}) and company type ({company_profile['company_type']}).
        
        Return ONLY a JSON object with subclassifications added.
        """
        
        try:
            response = self.openai_client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                response_format={"type": "json_object"},
                max_tokens=3000
            )
            
            return json.loads(response.choices[0].message.content)
            
        except Exception as e:
            logger.error(f"Subclassification addition failed: {str(e)}")
            return self._get_fallback_subclassifications()
    
    def _generate_complete_coa(self, subclassifications: Dict, company_profile: Dict) -> Dict:
        """Step 5: AI generates complete chart of accounts with account codes and names"""
        
        prompt = f"""
        Company Profile: {json.dumps(company_profile, indent=2)}
        Subclassification Structure: {json.dumps(subclassifications, indent=2)}
        
        Generate a comprehensive Chart of Accounts (80-120 accounts) with:
        - 4-digit account codes (1000-9999)
        - Descriptive account names
        - Relevant accounts for {company_profile['industry']} industry
        - Compliance with {company_profile['reporting_framework']} standards
        - Consider statutory requirements: {company_profile['statutory_compliances']}
        
        Use standard numbering:
        - 1000-1999: Assets
        - 2000-2999: Liabilities  
        - 3000-3999: Equity
        - 4000-4999: Revenue/Income
        - 5000-5999: Cost of Goods Sold
        - 6000-8999: Operating Expenses
        - 9000-9999: Non-Operating Items
        
        Return ONLY a JSON object with complete account details.
        Example structure:
        {{
            "statementOfFinancialPosition": [
                {{
                    "class": "Assets",
                    "classification": "Current Assets",
                    "subclassification": "Cash and Cash Equivalents",
                    "account": "Cash in Hand",
                    "code": "1001",
                    "description": "Physical cash held by the company"
                }}
            ]
        }}
        """
        
        try:
            response = self.openai_client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                response_format={"type": "json_object"},
                max_tokens=self.max_tokens
            )
            
            return json.loads(response.choices[0].message.content)
            
        except Exception as e:
            logger.error(f"Complete COA generation failed: {str(e)}")
            return self._generate_basic_coa(company_profile)
    
    def categorize_transaction_ai(
        self, 
        description: str, 
        amount: float, 
        transaction_type: str = "expense"
    ) -> Dict[str, Any]:
        """
        AI-powered transaction categorization
        """
        try:
            prompt = f"""
            Transaction Details:
            - Description: {description}
            - Amount: {amount}
            - Type: {transaction_type}
            
            Categorize this transaction and suggest the most appropriate account.
            
            Consider common business transaction patterns and provide:
            1. Suggested category name
            2. Account code (4-digit)
            3. Confidence level (0.0 to 1.0)
            4. Reasoning for the categorization
            
            Return ONLY a JSON object:
            {{
                "category": "suggested category name",
                "account_code": "account code",
                "confidence": 0.85,
                "reasoning": "explanation of why this category was chosen",
                "transaction_type": "debit or credit",
                "amount": {amount}
            }}
            """
            
            response = self.openai_client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                response_format={"type": "json_object"},
                max_tokens=500
            )
            
            result = json.loads(response.choices[0].message.content)
            
            return {
                "status": "success",
                "category": result.get("category", "Miscellaneous Expenses"),
                "account_code": result.get("account_code", "6999"),
                "confidence": result.get("confidence", 0.8),
                "reasoning": result.get("reasoning", "AI categorization"),
                "transaction_type": result.get("transaction_type", "debit"),
                "amount": amount,
                "method": "ai_categorization"
            }
            
        except Exception as e:
            logger.error(f"AI transaction categorization failed: {str(e)}")
            return self._fallback_categorization(description, amount, transaction_type)
    
    def _count_accounts(self, chart_of_accounts: Dict) -> int:
        """Count total accounts in chart of accounts"""
        count = 0
        for statement, accounts in chart_of_accounts.items():
            if isinstance(accounts, list):
                for account in accounts:
                    if "account" in account:
                        count += 1
        return count
    
    def _generate_fallback_coa(self, company_profile: Dict) -> Dict[str, Any]:
        """Generate fallback COA when AI fails"""
        logger.warning("Using fallback COA generation")
        
        fallback_coa = {
            "statementOfFinancialPosition": [
                {
                    "class": "Assets",
                    "classification": "Current Assets",
                    "subclassification": "Cash and Cash Equivalents",
                    "account": "Cash in Hand",
                    "code": "1001",
                    "description": "Physical cash held by the company"
                },
                {
                    "class": "Assets",
                    "classification": "Current Assets",
                    "subclassification": "Cash and Cash Equivalents",
                    "account": "Bank Account - Current",
                    "code": "1002",
                    "description": "Primary current account with bank"
                },
                {
                    "class": "Assets",
                    "classification": "Current Assets",
                    "subclassification": "Trade Receivables",
                    "account": "Accounts Receivable",
                    "code": "1101",
                    "description": "Amounts owed by customers"
                },
                {
                    "class": "Equity and Liabilities",
                    "classification": "Equity",
                    "subclassification": "Share Capital",
                    "account": "Ordinary Share Capital",
                    "code": "3001",
                    "description": "Capital contributed by shareholders"
                },
                {
                    "class": "Equity and Liabilities",
                    "classification": "Current Liabilities",
                    "subclassification": "Trade Payables",
                    "account": "Accounts Payable",
                    "code": "2001",
                    "description": "Amounts owed to suppliers"
                }
            ],
            "statementOfProfitAndLoss": [
                {
                    "classification": "Revenue",
                    "subclassification": "Operating Revenue",
                    "account": "Sales Revenue",
                    "code": "4001",
                    "description": "Revenue from primary business operations"
                },
                {
                    "classification": "Expenses", 
                    "subclassification": "Operating Expenses",
                    "account": "General Expenses",
                    "code": "6001",
                    "description": "General operating expenses"
                }
            ]
        }
        
        return {
            "status": "fallback",
            "company_profile": company_profile,
            "chart_of_accounts": fallback_coa,
            "metadata": {
                "total_accounts": self._count_accounts(fallback_coa),
                "generated_at": datetime.utcnow().isoformat(),
                "generation_method": "fallback_basic_coa"
            }
        }
    
    def _get_fallback_classifications(self) -> Dict:
        """Get fallback classification structure"""
        return {
            "statementOfProfitAndLoss": [
                {"class": "Revenue", "classification": "Operating Revenue"},
                {"class": "Revenue", "classification": "Non-Operating Revenue"},
                {"class": "Expenses", "classification": "Operating Expenses"},
                {"class": "Expenses", "classification": "Non-Operating Expenses"}
            ],
            "statementOfFinancialPosition": [
                {"class": "Assets", "classification": "Current Assets"},
                {"class": "Assets", "classification": "Non-Current Assets"},
                {"class": "Equity and Liabilities", "classification": "Equity"},
                {"class": "Equity and Liabilities", "classification": "Current Liabilities"},
                {"class": "Equity and Liabilities", "classification": "Non-Current Liabilities"}
            ]
        }
    
    def _get_fallback_subclassifications(self) -> Dict:
        """Get fallback subclassification structure"""
        return {
            "statementOfProfitAndLoss": [
                {"classification": "Operating Revenue", "subclassification": "Sales Revenue"},
                {"classification": "Operating Expenses", "subclassification": "General Expenses"}
            ],
            "statementOfFinancialPosition": [
                {"class": "Assets", "classification": "Current Assets", "subclassification": "Cash and Cash Equivalents"},
                {"class": "Assets", "classification": "Current Assets", "subclassification": "Trade Receivables"},
                {"class": "Equity and Liabilities", "classification": "Equity", "subclassification": "Share Capital"},
                {"class": "Equity and Liabilities", "classification": "Current Liabilities", "subclassification": "Trade Payables"}
            ]
        }
    
    def _generate_basic_coa(self, company_profile: Dict) -> Dict:
        """Generate basic COA structure"""
        return {
            "statementOfFinancialPosition": [
                {
                    "class": "Assets",
                    "classification": "Current Assets", 
                    "subclassification": "Cash and Cash Equivalents",
                    "account": "Cash in Hand",
                    "code": "1001",
                    "description": "Physical cash held by the company"
                }
            ],
            "statementOfProfitAndLoss": [
                {
                    "classification": "Revenue",
                    "subclassification": "Operating Revenue",
                    "account": "Sales Revenue",
                    "code": "4001",
                    "description": "Revenue from primary business operations"
                }
            ]
        }
    
    def _fallback_categorization(self, description: str, amount: float, transaction_type: str) -> Dict[str, Any]:
        """Fallback categorization when AI fails"""
        
        # Simple keyword-based categorization
        description_lower = description.lower()
        
        if any(word in description_lower for word in ['salary', 'wages', 'payroll']):
            category = "Salary Expenses"
            account_code = "6201"
        elif any(word in description_lower for word in ['rent', 'lease']):
            category = "Rent Expenses"
            account_code = "6301"
        elif any(word in description_lower for word in ['office', 'supplies', 'stationery']):
            category = "Office Expenses"
            account_code = "6101"
        elif any(word in description_lower for word in ['travel', 'transport']):
            category = "Travel Expenses"
            account_code = "6401"
        elif any(word in description_lower for word in ['utilities', 'electricity', 'water']):
            category = "Utility Expenses"
            account_code = "6501"
        else:
            category = "Miscellaneous Expenses"
            account_code = "6999"
        
        return {
            "status": "fallback",
            "category": category,
            "account_code": account_code,
            "confidence": 0.6,
            "reasoning": "Keyword-based fallback categorization",
            "transaction_type": "debit" if amount > 0 else "credit",
            "amount": amount,
            "method": "fallback_keyword_matching"
        }


# Create singleton instance
ai_generator = AIChartGenerator()

# Export for backward compatibility
def generate_ai_chart_of_accounts(
    company_name: str,
    nature_of_business: str,
    industry: str,
    location: str,
    company_type: str,
    reporting_framework: str,
    statutory_compliances: List[str]
) -> Dict[str, Any]:
    """Backward compatibility wrapper"""
    return ai_generator.generate_ai_chart_of_accounts(
        company_name=company_name,
        nature_of_business=nature_of_business,
        industry=industry,
        location=location,
        company_type=company_type,
        reporting_framework=reporting_framework,
        statutory_compliances=statutory_compliances
    )

def categorize_transaction_ai(description: str, amount: float, transaction_type: str = "expense") -> Dict[str, Any]:
    """Backward compatibility wrapper"""
    return ai_generator.categorize_transaction_ai(description, amount, transaction_type)

if __name__ == "__main__":
    # Test the AI generator
    test_profile = {
        "company_name": "Test Tech Company",
        "nature_of_business": "Software Development",
        "industry": "Technology",
        "location": "India",
        "company_type": "Private Limited",
        "reporting_framework": "Ind AS",
        "statutory_compliances": ["GST", "TDS", "PF", "ESI"]
    }
    
    print("Testing AI Chart Generator...")
    result = ai_generator.generate_ai_chart_of_accounts(**test_profile)
    print(f"Generated COA with {result['metadata']['total_accounts']} accounts")
    
    # Test transaction categorization
    print("\nTesting Transaction Categorization...")
    cat_result = ai_generator.categorize_transaction_ai("Office supplies purchase", 1500.0, "expense")
    print(f"Categorized as: {cat_result['category']} with confidence: {cat_result['confidence']}")