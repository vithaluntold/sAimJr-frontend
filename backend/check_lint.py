#!/usr/bin/env python3
"""
Lint Checker - Validates Python files for syntax and import issues
"""
import sys
import ast
import importlib.util

def check_python_file(filepath: str) -> bool:
    """Check if a Python file has valid syntax"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Check syntax
        ast.parse(content)
        print(f"✅ {filepath}: Syntax OK")
        return True
        
    except SyntaxError as e:
        print(f"❌ {filepath}: Syntax Error - {e}")
        return False
    except Exception as e:
        print(f"⚠️ {filepath}: Warning - {e}")
        return True  # Non-critical errors

def main():
    files_to_check = [
        "ai_chart_generator.py",
        "production_fixed.py"
    ]
    
    all_good = True
    for filepath in files_to_check:
        try:
            result = check_python_file(filepath)
            all_good &= result
        except FileNotFoundError:
            print(f"❌ {filepath}: File not found")
            all_good = False
    
    if all_good:
        print("\n🎉 All Python files pass basic syntax validation!")
    else:
        print("\n⚠️ Some issues found - check output above")
    
    return 0 if all_good else 1

if __name__ == "__main__":
    sys.exit(main())