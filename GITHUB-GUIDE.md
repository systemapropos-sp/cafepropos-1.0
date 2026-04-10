# Guía para GitHub

## Paso 1: Crear un Repositorio en GitHub

1. Ve a [github.com](https://github.com) e inicia sesión
2. Haz clic en el botón **"+"** (arriba a la derecha) → **"New repository"**
3. Completa la información:
   - **Repository name:** `cafepropos-1.0`
   - **Description:** "Sistema de Punto de Venta para Cafeterías"
   - **Visibility:** Público o Privado
4. Haz clic en **"Create repository"**

## Paso 2: Subir el Código

### Usando Git

1. Abre una terminal en la carpeta del proyecto:
```bash
cd /ruta/a/cafepropos-1.0
```

2. Inicializa Git:
```bash
git init
```

3. Agrega todos los archivos:
```bash
git add .
```

4. Crea el primer commit:
```bash
git commit -m "Initial commit: CafePOS v1.6"
```

5. Conecta con GitHub:
```bash
git remote add origin https://github.com/systemapropos-sp/cafepropos-1.0.git
```

6. Sube el código:
```bash
git branch -M main
git push -u origin main
```

## Comandos Útiles de Git

```bash
# Ver estado de cambios
git status

# Agregar cambios específicos
git add nombre-del-archivo

# Crear commit con mensaje
git commit -m "Descripción de los cambios"

# Subir cambios
git push

# Ver historial de commits
git log --oneline
```

## Estructura de Commits Recomendada

- `feat: nueva funcionalidad`
- `fix: corrección de bug`
- `docs: cambios en documentación`
- `style: cambios de estilo (CSS)`
- `refactor: refactorización de código`

## ¿Necesitas Ayuda?

- [Documentación de Git](https://git-scm.com/doc)
- [GitHub Docs](https://docs.github.com)
