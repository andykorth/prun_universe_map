import xml.etree.ElementTree as ET


def normalize_styles(svg_file, output_file):
    tree = ET.parse(svg_file)
    root = tree.getroot()

    # Function to normalize the style attribute
    def normalize_element_styles(element):
        style = element.attrib.get('style', '')
        style_dict = dict(item.split(':') for item in style.split(';') if item)

        for key, value in style_dict.items():
            element.set(key.strip(), value.strip())

        if 'style' in element.attrib:
            del element.attrib['style']

    # Normalize styles for rect elements
    for rect in root.findall('.//{http://www.w3.org/2000/svg}rect'):
        normalize_element_styles(rect)

    # Normalize styles for path elements
    for path in root.findall('.//{http://www.w3.org/2000/svg}path'):
        normalize_element_styles(path)

    tree.write(output_file)


# Usage
normalize_styles('PrUn_universe_map.svg', 'PrUn_universe_map_normalized.svg')
