import bpy
import os
import subprocess
import sys

def export_web_glb():
    selected = bpy.context.selected_objects
    if not selected:
        print("/// SYS.ERROR: Please select your mesh and rig first.")
        return

    blend_path = bpy.data.filepath
    if not blend_path:
        print("/// SYS.ERROR: Please save your .blend file first so the script knows where to export.")
        return

    export_dir = os.path.dirname(blend_path)
    active_obj = bpy.context.active_object
    base_name = active_obj.name.replace(" ", "_") if active_obj else "Exported_Asset"
    export_path = os.path.join(export_dir, f"{base_name}.glb")

    bpy.ops.export_scene.gltf(
        filepath=export_path,
        export_format='GLB',
        use_selection=True,
        export_yup=True,
        export_materials='EXPORT',
        export_skins=True,
        export_cameras=False,
        export_lights=False,
        export_animations=True,
        export_apply=False  # <--- Prevents the double-transform rig bug
    )
    
    print(f"/// SYS.SUCCESS -> Exported to: {export_path}")

    # Automatically open the export folder in your OS file manager
    try:
        if sys.platform == 'win32':
            os.startfile(export_dir)
        elif sys.platform == 'darwin':
            subprocess.Popen(['open', export_dir])
        else:
            subprocess.Popen(['xdg-open', export_dir])
    except Exception as e:
        print(f"/// SYS.WARNING -> Could not open file explorer automatically: {e}")

export_web_glb()