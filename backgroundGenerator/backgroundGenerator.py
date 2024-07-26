import pystache
import os

# Define the arrays of bgColors and titles
titles = ['ALW', 'BFI', 'BLI', 'COE', 'GEG', 'GRF', 'HIO', 'LMT', 'LWS', 'MFR', 'MWH', 'NUW', 'OLM', 'OTH', 'PAE', 'PDT', 'PDX', 'PSC', 'RDM', 'RNT', 'SEA', 'SFF', 'SKA', 'SLE', 'TCM', 'TDD', 'TIW', 'UAO', 'YKM'];
bgColors = {
    'black': 'current',
    '#f60': 'updated'
}

# Load the SVG template
with open('template.svg', 'r') as file:
    svg_template = file.read()

# Ensure the output directory exists
output_dir = 'atisBackgrounds'
os.makedirs(output_dir, exist_ok=True)

# Iterate through each combination of bgColor and title
for bgColor, state in bgColors.items():
    for title in titles:
        # Define the context for the mustache template
        context = {
            'bgColor': bgColor,
            'title': title
        }
        
        # Render the SVG with the current context
        rendered_svg = pystache.render(svg_template, context)
        
        # Define the output filename
        output_filename = os.path.join(output_dir, f"{title}-{state}.svg")
        
        # Save the rendered SVG to a file
        with open(output_filename, 'w') as output_file:
            output_file.write(rendered_svg)
        
        print(f"Generated {output_filename}")
