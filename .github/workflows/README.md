# GitHub Actions Workflows

## Docker Publishing Workflow

The `docker-publish.yml` workflow automatically builds and publishes Docker images to Docker Hub.

### 🚀 How It Works

The workflow is automatically triggered in the following cases:

- **Push to `master` branch**: Builds and publishes with `latest` and `master` tags
- **Push version tag** (e.g., `v1.0.0`): Publishes with semantic tags (`1.0.0`, `1.0`)
- **Manual trigger**: From the "Actions" tab using "workflow_dispatch"

### 🏷️ Docker Tags

The workflow generates the following tags:

- `latest` - Latest version from the main branch
- `master` - Main branch identifier
- `1.0.0` - Full semantic version (when pushing a v1.0.0 tag)
- `1.0` - Major.minor version (when pushing a tag)
- `master-<sha>` - Branch with commit SHA

### 📦 Image Location

Images are published to: https://hub.docker.com/r/alesquiintelligence/frontend

### 🔧 Usage

#### To publish a new version with a tag:

```bash
# Create and push a version tag
git tag v1.0.0
git push origin v1.0.0

# The workflow will automatically run and publish:
# - alesquiintelligence/frontend:1.0.0
# - alesquiintelligence/frontend:1.0
```

#### To publish from master:

```bash
# Simply push to master
git push origin master

# The workflow will publish:
# - alesquiintelligence/frontend:latest
# - alesquiintelligence/frontend:master
# - alesquiintelligence/frontend:master-<commit-sha>
```

#### To run manually:

1. Go to the "Actions" tab on GitHub
2. Select "Build and Push Docker Image"
3. Click on "Run workflow"
4. Select the branch and run

### ✅ Verification

After the workflow completes successfully:

1. Go to https://hub.docker.com/r/alesquiintelligence/frontend/tags
2. Verify that the new tags appear
3. Test the image locally:

```bash
docker pull alesquiintelligence/frontend:latest
docker run -p 80:80 alesquiintelligence/frontend:latest
```

### 🎯 Benefits

✅ **Fully automated** - No need for manual `docker build`/`docker push`  
✅ **Cloud-based** - Doesn't require Docker installed locally  
✅ **Automatic versioning** - Semantic tags with git tags  
✅ **Build caching** - GitHub Actions optimizes build times  
✅ **Professional DevOps** - Industry-standard CI/CD practice

### 🐛 Troubleshooting

If the workflow fails:

1. **Verify the secret**: Make sure `DOCKERHUB_TOKEN` is configured correctly in Settings → Secrets and variables → Actions
2. **Verify Docker Hub repository**: Confirm that `alesquiintelligence/frontend` exists on Docker Hub
3. **Verify permissions**: The token must have Read, Write, Delete permissions
4. **Review the logs**: Check detailed logs in the "Actions" tab

### 🔗 Resources

- [Docker Hub Repository](https://hub.docker.com/r/alesquiintelligence/frontend)
- [GitHub Actions Logs](../../actions/workflows/docker-publish.yml)
- [Dockerfile](../../blob/master/Dockerfile)
