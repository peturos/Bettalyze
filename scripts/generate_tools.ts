
import fs from 'fs';
import path from 'path';

async function generateTools() {
    const registryPath = path.join(process.cwd(), 'docs', 'view_registry.yaml');
    const rawYaml = fs.readFileSync(registryPath, 'utf8');

    // Minimalistic 'yaml' import attempt
    let yamlParser;
    try {
        yamlParser = await import('yaml');
    } catch (e) {
        console.log("Installing 'yaml' package for script...");
        const { execSync } = await import('child_process');
        execSync('npm install -D yaml', { stdio: 'inherit' });
        yamlParser = await import('yaml');
    }

    const registry = yamlParser.parse(rawYaml);

    const openAITools = registry.intents.map(intent => {
        const parameters = {
            type: "object",
            properties: {},
            required: []
        };

        if (intent.parameters) {
            intent.parameters.forEach(p => {
                parameters.properties[p.name] = {
                    type: p.type,
                    description: p.description
                };
                if (p.enum) {
                    parameters.properties[p.name].enum = p.enum;
                }
                if (p.required) {
                    parameters.required.push(p.name);
                }
            });
        }

        return {
            type: "function",
            function: {
                name: intent.id,
                description: intent.description,
                parameters: parameters
            }
        };
    });

    const outputPath = path.join(process.cwd(), 'docs', 'LLM_TOOLS.json');
    fs.writeFileSync(outputPath, JSON.stringify(openAITools, null, 2));
    console.log(`Generated docs/LLM_TOOLS.json with ${openAITools.length} tools.`);

    // Generate Backend Registry (includes SQL queries and metadata)
    const registryOutput = registry.intents.map(intent => ({
        id: intent.id,
        description: intent.description,
        view: intent.view,
        query_template: intent.query_template,
        parameters: intent.parameters,
        type: intent.type || 'vdb' // Default to Virtual Database view
    }));

    const registryPathJson = path.join(process.cwd(), 'docs', 'TOOL_REGISTRY.json');
    fs.writeFileSync(registryPathJson, JSON.stringify(registryOutput, null, 2));
    console.log(`Generated docs/TOOL_REGISTRY.json for Backend execution.`);
}

generateTools().catch(console.error);
