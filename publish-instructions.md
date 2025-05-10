# Publishing Your N8N Helm Chart Node to npm

Follow these steps to publish your N8N node to npm so you can use it in your N8N deployment:

## 1. Update package.json

```bash
cd n8n-nodes-helm-chart
cp package.json.stub package.json
```

Then edit the package.json file to include your information:

```json
{
  "name": "n8n-nodes-helm-chart",
  "version": "0.1.0",
  "description": "n8n node to perform Helm chart operations",
  "keywords": [
    "n8n-community-node-package",
    "helm",
    "kubernetes",
    "helm-chart"
  ],
  "license": "MIT",
  "homepage": "https://github.com/YOUR_USERNAME/n8n-nodes-helm-chart",
  "author": {
    "name": "YOUR NAME",
    "email": "YOUR_EMAIL"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/YOUR_USERNAME/n8n-nodes-helm-chart.git"
  }
}
```

## 2. Create an npm Account

If you don't have an npm account, create one at [npmjs.com](https://www.npmjs.com/signup).

## 3. Login to npm

```bash
npm login
```

Enter your username, password, and email when prompted.

## 4. Build the Package

```bash
npm run build
```

## 5. Publish to npm

```bash
npm publish
```

If this is your first time publishing this package, you should see it successfully published. If you're updating an existing package, you'll need to increment the version number in package.json first.

## 6. Installing in Your N8N Deployment

### Option 1: Direct Installation

```bash
cd YOUR_N8N_INSTALLATION
npm install n8n-nodes-helm-chart
```

Then restart your N8N instance.

### Option 2: Docker Setup

If you're using Docker, create a custom Dockerfile:

```dockerfile
FROM n8nio/n8n

# Install your custom node
RUN npm install n8n-nodes-helm-chart
```

Then build and run your custom Docker image:

```bash
docker build -t custom-n8n .
docker run -it --rm -p 5678:5678 custom-n8n
```

### Option 3: Using n8n-nodes-base.config.js

For newer versions of n8n, you can use the community nodes feature:

1. In your n8n installation directory, create a file named `n8n-nodes-base.config.js`:

```javascript
module.exports = {
  nodes: [
    'n8n-nodes-helm-chart'
  ],
};
```

2. Install your package:
```bash
npm install n8n-nodes-helm-chart
```

3. Restart n8n