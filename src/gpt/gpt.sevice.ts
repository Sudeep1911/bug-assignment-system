import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { ModulesRepo } from 'src/modules/modules.repo';
import { ProductRepo } from 'src/product/product.repo';

@Injectable()
export class GPTService {
  constructor(
    private modulesRepo: ModulesRepo,
    private projectRepo: ProductRepo
  ) {}

  async getCategoryAndPriority(
    projectId: string,
    desc: string,
    type: "dev" | "test"
  ) {
    try {
      // Fetch modules and employees directly from the database
      const [allModules, project] = await Promise.all([
        this.modulesRepo.getAllModulesByProjectId(projectId),
        this.projectRepo.getEmployeesByProjectId(projectId)
      ])
      // Prepare module name map
      const moduleMap = new Map<string, string>();
      allModules.forEach(mod => moduleMap.set(mod._id.toString(), mod.name));

      const moduleNames = Array.from(moduleMap.values());

      // Format employees with readable module names for GPT
      const formattedEmployees = project.employees
        .map(emp => {
          const empModules = emp.details?.modules || [];
          if (type === "test" && emp.role === "tester") {
            return {
              employeeId: emp._id.toString(),
              employeeName: emp.name || emp.email,
              role: emp.role,
              modules: empModules.map((modObj: any) => ({
                moduleName: moduleMap.get(modObj.module.toString()) || modObj.module.toString(),
                proficiency: modObj.proficiency || 0
              }))
            };
          } else if (type === "dev" && emp.role === "developer") {
            return {
              employeeId: emp._id.toString(),
              employeeName: emp.name || emp.email,
              role: emp.role,
              modules: empModules.map((modObj: any) => ({
                moduleName: moduleMap.get(modObj.module.toString()) || modObj.module.toString(),
                proficiency: modObj.proficiency || 0
              }))
            };
          }
          // Return undefined for non-matching employees
          return undefined;
        })
        .filter(Boolean); // Remove undefined entries

      // GPT prompt construction
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are a software project manager assistant who categorizes bugs, assigns priority, and picks the best developer or tester based on module proficiency.',
            },
            {
              role: 'user',
              content: `Bug Description: "${desc}"\n` +
                `Available Modules: ${moduleNames.join(', ')}\n` +
                `Priorities: High, Medium, Low\n\n` +
                `Employee List:\n${JSON.stringify(formattedEmployees, null, 2)}\n\n` +
                `Please suggest the most relevant Module (as Category), Priority, and the best matching Developer ID (based on module match and proficiency).\n` +
                `Just give in the format of Category: X, Priority: Y, DeveloperId: Z.`
            }
          ],
          max_tokens: 50,
          temperature: 0.5
        },
        {
          headers: {
            Authorization: process.env.CHATGPT_KEY,
            'OpenAI-Organization': process.env.ORG_KEY,
            'Content-Type': 'application/json',
          },
        },
      );

      const resultText = response.data.choices[0].message.content.trim(); // "Category: Frontend, Priority: High, DeveloperId: 6885e9ad22b23f9478fe5bbf"

      const keyValuePairs = resultText.split(',').map((item) => item.split(':').map(str => str.trim()));

      const resultJson = keyValuePairs.reduce((acc, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {} as Record<string, string>);

      // Find the matching module by name
      const module = allModules.find(m => m.name.toLowerCase() === resultJson.category?.toLowerCase());

      const assignedDeveloper = formattedEmployees.find(emp => emp.employeeId.toString() === resultJson.DeveloperId);
      const matchedModule = allModules.find(m =>
        m.name.trim().toLowerCase() === resultJson.Category?.trim().toLowerCase()
      );
      return {
        moduleId: matchedModule ? matchedModule._id.toString() : null,
        modulename: matchedModule ? matchedModule.name : null,
        priority: resultJson.Priority,
        assignedDeveloper,
      };

    } catch (error) {
      console.error('Error categorizing bug or assigning developer:', error);
      return {
        category: 'Uncategorized',
        priority: 'Unassigned',
        assignedDeveloper: null,
      };
    }
  }
}
