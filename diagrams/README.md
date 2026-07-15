# KalaShaala StarUML Diagrams

Open `KalaShaala_ER_DFD_StarUML.mdj` in StarUML.

## Included diagrams

1. `ER Diagram - KalaShaala MySQL Database`
   - Based on Django backend models from `custom_auth/models.py` and `blog/models.py`.
   - Includes users, portfolios, content, blogs, videos, documents, galleries, courses, modules, and comments.

2. `DFD Level 1 - KalaShaala Website`
   - Shows how visitors, artists, admins, frontend pages, backend processes, MySQL, media storage, and external services exchange data.

## Notes

- The ER diagram follows the current Django model structure.
- MySQL table creation should still be done with Django migrations using `python manage.py migrate`.
- The DFD is modeled with standard StarUML class diagram shapes so it can open without requiring a DFD extension.
