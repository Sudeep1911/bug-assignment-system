import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { ModulesRepo } from 'src/modules/modules.repo';
import { ProductRepo } from 'src/product/product.repo';
import { GoogleGenAI } from '@google/genai';

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
    ]);

    // Prepare module name map
    const moduleMap = new Map<string, string>();
    allModules.forEach(mod => moduleMap.set(mod._id.toString(), mod.name));

    const moduleNames = Array.from(moduleMap.values());

    // Format employees with readable module names for GenAI
    const formattedEmployees = project.employees
      .map(emp => {
        const empModules = emp.details?.modules || [];
        if (type === "test" && emp.role === "tester") {
          return {
            employeeId: emp._id.toString(),
            employeeName: emp.name || emp.email,
            role: emp.role,
            modules: empModules.map((modObj: any) => ({
              moduleName:
                moduleMap.get(modObj.module.toString()) ||
                modObj.module.toString(),
              proficiency: modObj.proficiency || 0
            }))
          };
        } else if (type === "dev" && emp.role === "developer") {
          return {
            employeeId: emp._id.toString(),
            employeeName: emp.name || emp.email,
            role: emp.role,
            modules: empModules.map((modObj: any) => ({
              moduleName:
                moduleMap.get(modObj.module.toString()) ||
                modObj.module.toString(),
              proficiency: modObj.proficiency || 0
            }))
          };
        }
        return undefined;
      })
      .filter(Boolean);

    // Google GenAI setup
    const ai = new GoogleGenAI({
      vertexai: true,
      project: "bug-tracker-pro-469407",
      location: "global"
    });
    const model = "gemini-2.5-flash-lite";

    const generationConfig = {
      maxOutputTokens: 250,
      temperature: 0.75,
      topP: 0.95
    };

    const chat = ai.chats.create({
      model: model,
      config: generationConfig
    });

    const prompt = {
      text:
        `You are a software project manager assistant who categorizes bugs, assigns priority, and picks the best developer or tester based on module proficiency.` +
        `Bug Description: "${desc}"` +
        `Available Modules: ${moduleNames.join(", ")}` +
        `Priorities: High, Medium, Low` +
        `Employee List: ${JSON.stringify(formattedEmployees)}` +
        `Please suggest the most relevant Module (as Category), Priority, and the best matching Developer ID (based on module match and proficiency).` +
        `Just give in the format of Category: X, Priority: Y, DeveloperId: Z.`
    };

    // Call Gemini and collect response
    // Call Gemini and collect response
    const response = await chat.sendMessage({ message: prompt });

    const resultText = response?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!resultText) {
      throw new Error("Empty response from GenAI");
    }

    // Parse result: "Category: Frontend, Priority: High, DeveloperId: 6885e9ad22b23f9478fe5bbf"
    const keyValuePairs = resultText
      .split(",")
      .map(item => item.split(":").map(str => str.trim()));

    const resultJson = keyValuePairs.reduce(
      (acc, [key, value]) => {
        acc[key] = value;
        return acc;
      },
      {} as Record<string, string>
    );

    const matchedModule = allModules.find(
      m =>
        m.name.trim().toLowerCase() ===
        resultJson.Category?.trim().toLowerCase()
    );

    const assignedDeveloper = formattedEmployees.find(
      emp => emp.employeeId.toString() === resultJson.DeveloperId
    );

    return {
      moduleId: matchedModule ? matchedModule._id.toString() : null,
      modulename: matchedModule ? matchedModule.name : null,
      priority: resultJson.Priority,
      assignedDeveloper
    };
  } catch (error) {
    console.error("Error categorizing bug or assigning developer:", error);
    return {
      category: "Uncategorized",
      priority: "Unassigned",
      assignedDeveloper: null
    };
  }
}
}
