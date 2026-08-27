# Blender MCP Geometry Nodes Research

## The Problem With Existing Tests

Most Blender MCP tests ask models to do freeform 3D modeling ("make a dragon") — which tests spatial reasoning and obscure bpy API knowledge. Nobody tests procedural geometry node generation, which is fundamentally different:

- **Constrained vocabulary** — finite set of nodes with fixed socket names
- **Structured data flow** — geometry → field → boolean, explicit graph assembly
- **Self-documenting failures** — broken node connections are visually obvious
- **Version-aware** — models have training cutoffs (likely Blender 4.x), testing on Blender 5.1 MCP is unfair unless you feed it the current API

## MCP Forks With Geometry Nodes Support

### 1. newo-ether/blender-mcp (structured geometry nodes fork)
**Repo:** https://github.com/newo-ether/blender-mcp
**Docs:** https://github.com/newo-ether/blender-mcp/blob/main/docs/geometry-nodes.md

Explicitly designed so models DON'T need to generate arbitrary bpy code. Instead uses a revisioned, structured patch workflow.

#### Dedicated MCP Tools for Geometry Nodes:
| Tool | Purpose |
|------|---------|
| `create_node_group` | Create empty Geometry node group |
| `ensure_geometry_nodes_modifier` | Attach modifier to mesh host |
| `list_geometry_node_trees` | List existing trees, revisions, users |
| `get_geometry_node_tree_index` | Search/page compact node names/types |
| `export_geometry_node_tree` | Export full graph or N-hop subgraph |
| `get_geometry_node_type_schema` | **Probe sockets and RNA in running Blender version** |
| `search_geometry_node_types` | Search node types available in current Blender |
| `search_blender_node_assets` | Inspect bundled node assets |
| `import_blender_node_asset` | Import a node asset |
| `validate_geometry_node_patch` | **Structural validation + disposable dry-run** |
| `apply_geometry_node_patch` | **Transactional apply with rollback and diff** |

#### Patch Operations:
- `add_node`, `remove_node`, `rename_node`
- `set_node_property`, `set_socket_default`
- `set_socket_hide`
- `add_link`, `remove_link`
- `set_node_layout`
- `add_interface_panel`, `add_interface_socket`, `remove_interface_socket`
- `set_modifier_input`

#### Revision System:
- Every tree has a `revision` hash (semantic + layout)
- Validation rejects stale base revisions
- Dry-run applies to disposable copy, reports candidate revision
- Application uses verified copy, creates backup, reports actual diff
- Original tree retained as fake-user backup named from revision

#### Compatibility:
- Blender 5.1.2: Full acceptance pass
- Blender 5.2 LTS RC: Full acceptance pass
- Blender 4.2 LTS: Intended boundary, not locally verified
- Blender 3.x: Not supported

#### Workflow:
1. Create group or select existing
2. Get index / search available node types
3. Export current tree (semantic or operations view)
4. Create patch file using file-edit tools
5. Validate with dry-run
6. Apply transactionally
7. Check diff, re-export next iteration

**Schemas available at:**
- https://github.com/newo-ether/blender-mcp/blob/main/schemas/geometry-nodes-v1.json
- https://github.com/newo-ether/blender-mcp/blob/main/schemas/geometry-nodes-patch-v1.json

### 2. ZachHandley/blender-mcp-enhanced
**Tool:** `complete_geometry_node`
**Source:** https://glama.ai/mcp/servers/ZachHandley/blender-mcp-enhanced/tools/complete_geometry_node

Takes structured JSON definitions of nodes, links, and inputs. Example:
```json
nodes = [
    {"type": "NodeGroupInput", "location": [0, 0]},
    {"type": "GeometryNodeMeshCube", "location": [200, 200], "inputs": {"Size": [2, 0.1, 1]}},
    {"type": "GeometryNodeJoinGeometry", "location": [400, 100]},
    {"type": "NodeGroupOutput", "location": [600, 100]}
]
links = [
    {"from_node": 1, "from_socket": "Mesh", "to_node": 3, "to_socket": 0}
]
```

## Key Insight for Prompt Design

The newo-ether fork's recommended workflow is THE blueprint for prompting local models:

1. **Start with discovery** — `search_geometry_node_types` or `get_geometry_node_type_schema` first. This is version-aware and tells the model exactly what nodes/sockets exist in the running Blender. No guessing from training cutoff data.

2. **Export first, edit second** — Always export the current tree before patching. This gives the model context about what already exists.

3. **Patch in small transactions** — Each patch is a focused change (add node, link two sockets, set a value). Not a full tree rewrite.

4. **Validate before applying** — The dry-run catches structural errors before they touch the real scene.

5. **Read the diff** — The apply response returns the actual diff, so the model can verify its change landed correctly.

## Prompting Strategy for Local Models

Rather than: *"Create a procedural building generator"*

Try: 
- *"Search for available mesh primitive nodes and list their socket schemas"*
- *"Based on the schemas, create a node group with a Cube → Subdivision Surface → Set Position chain"*
- *"Now patch in a Noise Texture driving the offset on the Set Position node"*

This breaks the problem into schema-constrained steps that small models handle well.

## Community Context

- MindStudio's Blender MCP evaluation confirms: "Node-based workflows — Geometry Nodes, complex material networks, compositor setups — are difficult" for Claude, let alone local models
- Reddit consensus: "I haven't been able to get results beyond a simple..." from users testing local models with Blender MCP
- But these tests all use the freeform bpy approach, not the structured patch workflow
- No public tests exist using the newo-ether fork's structured approach with any model size
