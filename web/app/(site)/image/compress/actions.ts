"use server"

import { API_IMAGES } from "@/constants/api";
import { ApiResponse, fetchGET, fetchPOST, fetchPOSTFormData } from "@/utils/fetchServer";

export type Instruction = {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  updated_at: string;
};

export type InstructionFile = {
  id: string;
  instruction_id: string;
  original_name: string;
  file_name: string;
  size: number;
  status: string;
  output_id?: string;
};

export async function createInstruction(productKey: string): Promise<ApiResponse<{ instruction: Instruction }>> {
  return await fetchPOST(`${API_IMAGES}/instructions`, { productKey });
}

export async function createInstructionDetails(
  instructionId: string,
  file: File
): Promise<ApiResponse<{ input: InstructionFile; output: InstructionFile }>> {
  const formData = new FormData();
  formData.append("file", file);
  return await fetchPOSTFormData(`${API_IMAGES}/instructions/${instructionId}/details`, formData);
}

export async function getInstructionDetails(
  id: string
): Promise<ApiResponse<{ files: InstructionFile[] }>> {
  return await fetchGET(`${API_IMAGES}/instructions/${id}/details`);
}
