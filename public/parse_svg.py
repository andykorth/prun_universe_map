import xml.etree.ElementTree as ET
import json

def parse_svg(svg_file):
    tree = ET.parse(svg_file)
    root = tree.getroot()

    namespace = {'svg': 'http://www.w3.org/2000/svg', 'inkscape': 'http://www.inkscape.org/namespaces/inkscape'}

    systems = {}
    edges = []

    # Extract systems (nodes)
    for rect in root.findall('.//svg:rect', namespace):
        system_id = rect.get('id')
        x = float(rect.get('x'))
        y = float(rect.get('y'))
        systems[system_id] = {'x': x, 'y': y}

    # Extract edges (connections)
    for path in root.findall('.//svg:path', namespace):
        start_id = path.get('{http://www.inkscape.org/namespaces/inkscape}connection-start').lstrip('#')
        end_id = path.get('{http://www.inkscape.org/namespaces/inkscape}connection-end').lstrip('#')
        if start_id in systems and end_id in systems:
            # Calculate distance between systems
            x1, y1 = systems[start_id]['x'], systems[start_id]['y']
            x2, y2 = systems[end_id]['x'], systems[end_id]['y']
            distance = ((x2 - x1)**2 + (y2 - y1)**2) ** 0.5
            edges.append({'start': start_id, 'end': end_id, 'distance': distance})

    return systems, edges

def save_graph_data(systems, edges, output_file):
    graph = {'systems': systems, 'edges': edges}
    with open(output_file, 'w') as f:
        json.dump(graph, f, indent=2)

if __name__ == '__main__':
    svg_file = './PrUn_universe_map_normalized.svg'
    output_file = './graph_data.json'

    systems, edges = parse_svg(svg_file)
    save_graph_data(systems, edges, output_file)

    print(f"Graph data saved to {output_file}")
