// Template definitions and ordering are kept separate from application logic
// to make maintenance and updates simpler.
(function () {
	const sections = {
		badges: `<!-- Badges -->
![GitHub](https://img.shields.io/badge/github-{{username}}/{{repo}}-000000?style=flat&logo=github)
![Build Status](https://img.shields.io/badge/build-{{buildStatus}}-brightgreen)
![Coverage](https://img.shields.io/badge/coverage-95%25-brightgreen)
![Version](https://img.shields.io/badge/version-{{buildVersion}}-blue)
![License](https://img.shields.io/badge/license-{{licenseType}}-blue)

`,

		description: `## Description

{{projectDesc}}

**Key Features:**
- Feature 1
- Feature 2
- Feature 3

`,

		quickstart: `## Quick Start

\`\`\`bash
# Clone the repository
git clone https://github.com/{{username}}/{{repo}}.git

# Navigate to directory
cd {{repo}}

# Install dependencies
install-command

# Run the application
start-command
\`\`\`

`,

		prerequisites: `## Prerequisites

Before you begin, ensure you have met the following requirements:

- Requirement 1
- Requirement 2
- Requirement 3

`,

		installation: `## Installation

\`\`\`bash
package-manager install package-name
\`\`\`

`,

		configuration: `## Configuration

Create a \`.env\` file in the root directory:

\`\`\`env
API_KEY=your_api_key_here
DATABASE_URL=postgresql://localhost:5432/dbname
PORT=3000
NODE_ENV=development
\`\`\`

`,

		usage: `## Usage

\`\`\`javascript
import { example } from 'package-name';

// Basic usage example
const result = example({
  option1: 'value1',
  option2: true
});

console.log(result);
\`\`\`

`,

		testing: `## Testing

Run the test suite:

\`\`\`bash
# Run all tests
test-command

# Run tests in watch mode
test-command --watch

# Generate coverage report
test-command --coverage
\`\`\`

`,

		api: `## API Documentation

### Base URL
\`\`\`
{{apiUrl}}
\`\`\`

### Authentication
\`\`\`bash
curl -H "Authorization: Bearer YOUR_API_KEY" \\
  {{apiUrl}}/endpoint
\`\`\`

### Endpoints

#### GET /resource
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| limit | integer | No | Number of items (default: 10) |
| offset | integer | No | Pagination offset |

`,

		troubleshooting: `## Troubleshooting

### Common Issues

**Issue: Application won't start**
\`\`\`bash
# Clear cache and reinstall dependencies
rm -rf node_modules package-lock.json
package-manager install
\`\`\`

**Issue: Port already in use**
\`\`\`bash
# Find and kill the process using the port
lsof -ti:3000 | xargs kill -9
\`\`\`

`,

		deployment: `## Deployment

### Production Build

\`\`\`bash
build-command
\`\`\`

### Deploy

\`\`\`bash
# Deploy to production
deploy-command
\`\`\`

`,

		contributing: `## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (\`git checkout -b feature/AmazingFeature\`)
3. Commit your changes (\`git commit -m 'Add some AmazingFeature'\`)
4. Push to the branch (\`git push origin feature/AmazingFeature\`)
5. Open a Pull Request

Please make sure to:
- Follow the existing code style
- Write tests for new features
- Update documentation as needed

`,

		security: `## Security

### Reporting Vulnerabilities

If you discover a security vulnerability, please email {{contactEmail}}. Do not open a public issue.

We take all security reports seriously and will respond within 48 hours.

`,

		license: `## License

This project is licensed under the {{licenseType}} License - see the [LICENSE](LICENSE) file for details.

`,

		changelog: `## Changelog

All notable changes to this project will be documented here.

### [Unreleased]

#### Added
- New feature 1
- New feature 2

#### Changed
- Updated dependency X to version Y

#### Fixed
- Bug fix for issue #123

### [{{buildVersion}}] - {{date}}
#### Added
- Initial release

`,

		quickPR: `# PR: {{prTitle}}

**Date:** {{date}}

## Overview
<!-- Brief description of what this PR accomplishes and why -->


## Key Changes

### Component/Module Updates
- 

### Dependency Updates
- 

### Configuration Changes
- 

### Database/Schema Changes
- 

## Testing
- [ ] Unit tests passing
- [ ] Integration tests passing  
- [ ] Cypress/E2E tests updated
- [ ] Manual testing complete
- [ ] Accessibility verified

## Deployment Notes
<!-- Any special deployment instructions, migrations, or rollout considerations -->


## Related
**Ticket:** {{ticketNumber}}
`
	};

	const templateOrder = [
		'quickPR', 'badges', 'description', 'quickstart', 'prerequisites', 'installation',
		'configuration', 'usage', 'testing', 'api', 'troubleshooting',
		'deployment', 'contributing', 'security', 'license', 'changelog'
	];

	window.TemplateData = { sections, templateOrder };
})();
