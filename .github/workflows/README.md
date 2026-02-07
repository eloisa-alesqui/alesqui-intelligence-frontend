# GitHub Actions Workflows

## Docker Publishing Workflow

El workflow `docker-publish.yml` construye y publica automáticamente imágenes Docker en Docker Hub.

### 🚀 Funcionamiento

El workflow se activa automáticamente en los siguientes casos:

- **Push a rama `master`**: Construye y publica con tags `latest` y `master`
- **Push de tag de versión** (ej: `v1.0.0`): Publica con tags semánticos (`1.0.0`, `1.0`)
- **Trigger manual**: Desde la pestaña "Actions" usando "workflow_dispatch"

### 🏷️ Tags de Docker

El workflow genera los siguientes tags:

- `latest` - Última versión de la rama principal
- `master` - Identificador de rama principal
- `1.0.0` - Versión semántica completa (cuando se pushea un tag v1.0.0)
- `1.0` - Versión major.minor (cuando se pushea un tag)
- `master-<sha>` - Rama con commit SHA

### 📦 Ubicación de la Imagen

Las imágenes se publican en: https://hub.docker.com/r/alesquiintelligence/frontend

### 🔧 Uso

#### Para publicar una nueva versión con tag:

```bash
# Crear y pushear tag de versión
git tag v1.0.0
git push origin v1.0.0

# El workflow se ejecutará automáticamente y publicará:
# - alesquiintelligence/frontend:1.0.0
# - alesquiintelligence/frontend:1.0
```

#### Para publicar desde master:

```bash
# Simplemente hacer push a master
git push origin master

# El workflow publicará:
# - alesquiintelligence/frontend:latest
# - alesquiintelligence/frontend:master
# - alesquiintelligence/frontend:master-<commit-sha>
```

#### Para ejecutar manualmente:

1. Ve a la pestaña "Actions" en GitHub
2. Selecciona "Build and Push Docker Image"
3. Click en "Run workflow"
4. Selecciona la rama y ejecuta

### ✅ Verificación

Después de que el workflow se complete exitosamente:

1. Ve a https://hub.docker.com/r/alesquiintelligence/frontend/tags
2. Verifica que aparezcan los nuevos tags
3. Prueba la imagen localmente:

```bash
docker pull alesquiintelligence/frontend:latest
docker run -p 80:80 alesquiintelligence/frontend:latest
```

### 🎯 Beneficios

✅ **Totalmente automatizado** - Sin necesidad de `docker build`/`docker push` manual  
✅ **Funciona en la nube** - No requiere Docker instalado localmente  
✅ **Versionado automático** - Tags semánticos con git tags  
✅ **Caché de builds** - GitHub Actions optimiza los tiempos de construcción  
✅ **DevOps profesional** - Práctica estándar de CI/CD en la industria

### 🐛 Troubleshooting

Si el workflow falla:

1. **Verifica el secret**: Asegúrate de que `DOCKERHUB_TOKEN` esté configurado correctamente en Settings → Secrets and variables → Actions
2. **Verifica el repositorio Docker Hub**: Confirma que existe `alesquiintelligence/frontend` en Docker Hub
3. **Verifica permisos**: El token debe tener permisos de Read, Write, Delete
4. **Revisa los logs**: Consulta los logs detallados en la pestaña "Actions"

### 🔗 Recursos

- [Docker Hub Repository](https://hub.docker.com/r/alesquiintelligence/frontend)
- [GitHub Actions Logs](../../actions/workflows/docker-publish.yml)
- [Dockerfile](../../blob/master/Dockerfile)
