#!/usr/bin/env python3
"""
Playwright Helper Script
Common Playwright operations for MiMoCode
"""

import subprocess
import sys
import os
from pathlib import Path


def run_command(cmd, description):
    """Run a command and print results."""
    print(f"\n{'='*60}")
    print(f"Running: {description}")
    print(f"Command: {cmd}")
    print('='*60)
    
    try:
        result = subprocess.run(
            cmd,
            shell=True,
            capture_output=True,
            text=True,
            check=True
        )
        print("STDOUT:")
        print(result.stdout)
        if result.stderr:
            print("STDERR:")
            print(result.stderr)
        return True
    except subprocess.CalledProcessError as e:
        print(f"Error: {e}")
        print("STDOUT:")
        print(e.stdout)
        print("STDERR:")
        print(e.stderr)
        return False


def setup_playwright():
    """Initialize Playwright in the current project."""
    print("\n🔧 Setting up Playwright...")
    
    # Check if package.json exists
    if not Path("package.json").exists():
        print("❌ No package.json found. Please run 'npm init' first.")
        return False
    
    # Install Playwright
    if not run_command("npm init playwright@latest", "Initialize Playwright"):
        return False
    
    print("\n✅ Playwright setup complete!")
    print("\nNext steps:")
    print("1. Review playwright.config.ts")
    print("2. Run 'npx playwright test' to verify setup")
    print("3. Open tests/ directory to see example tests")
    return True


def run_tests(pattern=None, project=None, headed=False, debug=False):
    """Run Playwright tests with various options."""
    cmd = "npx playwright test"
    
    if pattern:
        cmd += f" --grep \"{pattern}\""
    if project:
        cmd += f" --project={project}"
    if headed:
        cmd += " --headed"
    if debug:
        cmd += " --debug"
    
    return run_command(cmd, "Running Playwright tests")


def show_report():
    """Open the Playwright HTML report."""
    return run_command("npx playwright show-report", "Opening HTML report")


def install_browsers():
    """Install Playwright browsers."""
    return run_command("npx playwright install", "Installing Playwright browsers")


def main():
    if len(sys.argv) < 2:
        print("Playwright Helper Script")
        print("\nUsage:")
        print("  python playwright_helper.py setup          - Initialize Playwright")
        print("  python playwright_helper.py run [pattern]  - Run tests")
        print("  python playwright_helper.py run-headed     - Run tests in headed mode")
        print("  python playwright_helper.py debug [pattern]- Run tests in debug mode")
        print("  python playwright_helper.py report         - Open HTML report")
        print("  python playwright_helper.py install        - Install browsers")
        return
    
    command = sys.argv[1]
    
    if command == "setup":
        setup_playwright()
    elif command == "run":
        pattern = sys.argv[2] if len(sys.argv) > 2 else None
        run_tests(pattern=pattern)
    elif command == "run-headed":
        run_tests(headed=True)
    elif command == "debug":
        pattern = sys.argv[2] if len(sys.argv) > 2 else None
        run_tests(pattern=pattern, debug=True)
    elif command == "report":
        show_report()
    elif command == "install":
        install_browsers()
    else:
        print(f"Unknown command: {command}")
        print("Use 'python playwright_helper.py' to see available commands")


if __name__ == "__main__":
    main()
