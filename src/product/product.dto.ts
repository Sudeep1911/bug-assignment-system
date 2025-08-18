// create-project.dto.ts
export interface CreateProjectDto {
  adminId: string;
  companyId: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  kanbanStages: string[];
  modules: string[];
  employees: {
    employeeId: string;
    assignedModules: {
      moduleId: string;
      proficiency: number;
    }[];
  }[];
}
