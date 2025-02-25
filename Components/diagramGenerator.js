const plantuml = require('node-plantuml');
const fs = require('fs');
const path = require('path');

async function generateCCDDiagram(ccdDiagramCode, folderPath) {
    try{
        const outputFolder = path.join(folderPath, 'CodeXView');  // Folder: 'diagrams'
        const outputFilePath = path.join(outputFolder, 'CCD-Diagram.svg');  // File inside folder

        // ✅ Create folder if it doesn't exist
        if (!fs.existsSync(outputFolder)) {
            fs.mkdirSync(outputFolder, { recursive: true });  // Ensures nested folders can be created
            console.log(`Created folder: ${outputFolder}`);
        }
        // create CCD diagram
        const gen = plantuml.generate(ccdDiagramCode);
        const stream = fs.createWriteStream(outputFilePath);

        return new Promise((resolve, reject) => {
            gen.out.pipe(stream);

            stream.on('finish', () => {
                console.log(`CCD Diagram saved at: ${outputFilePath}`);
                resolve(true);  // ✅ Return true on success
            });

            stream.on('error', (err) => {
                console.error(`Error saving CCD diagram: ${err.message}`);
                reject(false);  // ❌ Return false on failure
            });
        });
    }catch (error) {
        console.error(`Error generating CCD diagram: ${error.message}`);
        return false;  // ❌ Return false if an unexpected error occurs
    }
    
}


const exampleccdDiagram = `
@startuml
class User <<entity>> {
    - id: int
    - name: string
    + getProfile()
}
class UserService <<service>> {
    + getUser(id: int): User
}
UserService --> User
@enduml
`;

module.exports = { generateCCDDiagram };