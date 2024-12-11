# Contributing to This Project

We’re excited that you’re interested in contributing to the **Datai Projection Network** ecosystem. Your help is invaluable in improving our codebase, documentation, and overall developer experience. This document outlines how to propose changes, collaborate via branches and pull requests, and adhere to our coding, testing, and review standards.

## How to Propose Changes

1. **Check Existing Issues:**  
   Before proposing a new feature or fixing a bug, review the open issues. If your idea is already discussed, consider joining that conversation.

2. **Open a New Issue (If Needed):**  
   If you don’t find an existing issue, create a new one. Clearly describe the problem or feature request, why it’s needed, and potential approaches. This helps us understand and discuss your idea before you start coding.

## Branching and Workflow

1. **Fork the Repository (If External Contributor):**  
   If you’re not part of the organization, fork the repository to your own GitHub account. Then clone your fork and work locally.

2. **Create a Feature Branch:**  
   Use a descriptive name for your branch, such as `feature/add-new-endpoint` or `fix/transaction-aggregation-bug`. This makes it easier for others to understand the scope of your changes.
   ```bash
   git checkout -b feature/my-new-feature
   ```
   
3. **Make Incremental Changes and Commit Frequently:**  
   Commit often with clear, concise commit messages. This approach helps track progress and makes it easier to review and revert changes if needed.
   ```bash
   git add .
   git commit -m "Implement projection filtering by eventType"
   ```

4. **Sync with Upstream Regularly:**  
   Keep your branch up-to-date with the main branch to avoid merge conflicts:
   ```bash
   git pull origin main
   ```

## Submitting Pull Requests (PRs)

1. **Open a Pull Request (PR):**  
   Once your changes are ready, push your branch to GitHub and open a PR against the main branch of the original repository.
   
2. **PR Description:**  
   - Include a summary of the changes and the reasoning behind them.  
   - Reference any related issue numbers using `#issue-number` syntax.  
   - If your changes are significant, outline steps to reproduce or test.

3. **Draft vs. Ready for Review:**  
   If your work is still in progress, you can open a draft PR. Once you’ve addressed initial feedback or finished your changes, mark it as “Ready for review.”

## Coding Standards and Guidelines

1. **Code Style:**  
   - Follow standard JavaScript/TypeScript style guidelines (e.g., ESLint configurations) where applicable.  
   - Use consistent indentation, naming conventions, and comments for clarity.
   
2. **Code Organization:**  
   - Keep functions and modules small and focused.  
   - Avoid duplicating code; refactor common functionality into shared modules.

3. **Documentation & Comments:**  
   - Update relevant documentation (e.g., `README.md`, `CONFIG_REFERENCE.md`) if your changes introduce new features or modify existing behavior.  
   - Comment complex logic to help future contributors understand your intentions.

## Testing Requirements

1. **Write Tests for New Code:**  
   Add or update unit and integration tests to cover any new functionality or to ensure bugs don’t reoccur.

2. **Run Tests Locally:**  
   Before submitting a PR, run the entire test suite to ensure everything passes:
   ```bash
   npm test
   ```
   
3. **Maintain Coverage:**  
   Aim to maintain or improve test coverage. PRs that significantly reduce coverage may require additional test cases before merging.

## Code Review and Approval

1. **Peer Review:**  
   Your PR will be reviewed by other maintainers or contributors. They may leave comments, request changes, or suggest improvements.
   
2. **Responding to Feedback:**  
   Be open to constructive feedback. Push additional commits addressing reviewer comments. Once updated, leave a comment indicating the changes have been made.

3. **Approval and Merge:**  
   Once your PR receives at least one approval from a maintainer and passes all tests, it can be merged. We prefer “Squash and merge” to keep the commit history clean.

---

**Thank you for taking the time to contribute!** Your efforts help build a stronger, more robust data network for everyone. If you have any questions or need guidance, feel free to open an issue or reach out to the community.
