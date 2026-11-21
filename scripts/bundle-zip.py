import zipfile
import os

os.makedirs('public', exist_ok=True)
os.makedirs('dist', exist_ok=True)

# Build public/cloudflare-pages.zip containing all deployable files in dist/
# Strictly exclude _routes.json (rejected by Cloudflare Pages Direct Upload) and internal aistudio assets
zip_path = 'public/cloudflare-pages.zip'
with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as z:
    for root, dirs, files in os.walk('dist'):
        dirs[:] = [d for d in dirs if d != 'aistudio']
        for file in files:
            if file == 'cloudflare-pages.zip' or file == '_routes.json' or file.endswith('.ts') or file.endswith('.tsx'):
                continue
            full_path = os.path.join(root, file)
            rel_path = os.path.relpath(full_path, 'dist').replace(os.sep, '/')
            if rel_path.startswith('assets/aistudio/'):
                continue
            z.write(full_path, rel_path)

with zipfile.ZipFile(zip_path, 'r') as z_check:
    bad_file = z_check.testzip()
    if bad_file is not None:
        raise RuntimeError(f"Corrupted file in zip: {bad_file}")

print("Created and verified public/cloudflare-pages.zip successfully!")

