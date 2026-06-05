export type ProfessionalOption = {
  label: string;
  value: string;
};

export const professionalCouncilOptions: ProfessionalOption[] = [
  { label: "CRM - Conselho Regional de Medicina", value: "CRM" },
  { label: "COREN - Conselho Regional de Enfermagem", value: "COREN" },
  { label: "CRP - Conselho Regional de Psicologia", value: "CRP" },
  { label: "CREFITO - Conselho Regional de Fisioterapia e Terapia Ocupacional", value: "CREFITO" },
  { label: "CRN - Conselho Regional de Nutricionistas", value: "CRN" },
  { label: "Outro conselho", value: "OTHER" },
];

export const professionalStateOptions: ProfessionalOption[] = [
  { label: "Acre (AC)", value: "AC" },
  { label: "Alagoas (AL)", value: "AL" },
  { label: "Amapá (AP)", value: "AP" },
  { label: "Amazonas (AM)", value: "AM" },
  { label: "Bahia (BA)", value: "BA" },
  { label: "Ceará (CE)", value: "CE" },
  { label: "Distrito Federal (DF)", value: "DF" },
  { label: "Espírito Santo (ES)", value: "ES" },
  { label: "Goiás (GO)", value: "GO" },
  { label: "Maranhão (MA)", value: "MA" },
  { label: "Mato Grosso (MT)", value: "MT" },
  { label: "Mato Grosso do Sul (MS)", value: "MS" },
  { label: "Minas Gerais (MG)", value: "MG" },
  { label: "Pará (PA)", value: "PA" },
  { label: "Paraíba (PB)", value: "PB" },
  { label: "Paraná (PR)", value: "PR" },
  { label: "Pernambuco (PE)", value: "PE" },
  { label: "Piauí (PI)", value: "PI" },
  { label: "Rio de Janeiro (RJ)", value: "RJ" },
  { label: "Rio Grande do Norte (RN)", value: "RN" },
  { label: "Rio Grande do Sul (RS)", value: "RS" },
  { label: "Rondônia (RO)", value: "RO" },
  { label: "Roraima (RR)", value: "RR" },
  { label: "Santa Catarina (SC)", value: "SC" },
  { label: "São Paulo (SP)", value: "SP" },
  { label: "Sergipe (SE)", value: "SE" },
  { label: "Tocantins (TO)", value: "TO" },
];

export const professionalSpecialtyOptions: ProfessionalOption[] = [
  { label: "Nenhuma", value: "none" },
  { label: "Enfermagem obstétrica", value: "obstetric-nursing" },
  { label: "Enfermagem neonatal", value: "neonatal-nursing" },
  { label: "Enfermagem materno-infantil", value: "maternal-child-nursing" },
  { label: "Enfermagem pediátrica", value: "pediatric-nursing" },
  { label: "Ginecologia e obstetrícia", value: "gynecology-obstetrics" },
  { label: "Obstetrícia", value: "obstetrics" },
  { label: "Pediatria", value: "pediatrics" },
  { label: "Neonatologia", value: "neonatology" },
  { label: "Medicina de família e comunidade", value: "family-community-medicine" },
  { label: "Psiquiatria perinatal", value: "perinatal-psychiatry" },
  { label: "Outra", value: "other" },
];
