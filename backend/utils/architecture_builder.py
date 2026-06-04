from backend.utils.layer_classifier import (
    classify_component
)

def build_architecture(dependency_data):

    architecture = {

        "entry_points":
        dependency_data["entry_points"],

        "layers": [

            {
                "name": "Presentation Layer",
                "components": []
            },

            {
                "name": "API Layer",
                "components": []
            },

            {
                "name": "Data Layer",
                "components": []
            },

            {
                "name": "AI Layer",
                "components": []
            },
            
            {
                "name": "Business Layer",
                "components": []
            }
        ]
    }
    for file in dependency_data["frontend_files"]:
        architecture["layers"][0][
        "components"
        ].append(file)

    for imp in dependency_data["internal_imports"]:
        layer = classify_component(imp)

        print("CLASSIFYING:", imp, "->", layer)

        if layer == "Presentation Layer":

            architecture["layers"][0]["components"].append(imp)

        elif layer == "API Layer":

            architecture["layers"][1]["components"].append(imp)

        elif layer == "Data Layer":

            architecture["layers"][2]["components"].append(imp)

        elif layer == "AI Layer":

            architecture["layers"][3]["components"].append(imp)

        elif layer == "Business Layer":

            architecture["layers"][4]["components"].append(imp)

            print("\nARCHITECTURE DATA:")
            
            print(architecture)
            return architecture


