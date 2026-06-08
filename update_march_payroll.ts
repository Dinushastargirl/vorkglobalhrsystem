import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing Supabase environment variables!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

const employeeData = [
  { branch: "Colombo", name: "Dinusha Pushparajah", start: "2/15/2026", salaryA: 80000, epf: 6400, advances: 0, cover: 0, intensive: 0, travelling: 0 },
  { branch: "Kandy", name: "Janani Saijanani", start: "3/10/2026", salaryA: 50000, epf: 4000, advances: 0, cover: 0, intensive: 0, travelling: 0 },
  { branch: "Galle", name: "Nisal Sayuranga", start: "4/1/2026", salaryA: 50000, epf: 4000, advances: 0, cover: 0, intensive: 0, travelling: 0 },
  { branch: "Headquarters", name: "Jayaminda", start: "1/20/2026", salaryA: 50000, epf: 4000, advances: 0, cover: 0, intensive: 0, travelling: 0 }
];

async function migrate() {
  console.log('Starting final migration for March 2026 payroll...');

  const month = 3;
  const year = 2026;

  for (const item of employeeData) {
    try {
      // 1. Find Profile by name with exact mapping where needed
      const { data: profiles, error: pError } = await supabase.from('profiles')
        .select('id, name')
        .ilike('name', `%${item.name}%`);

      if (pError || !profiles || profiles.length === 0) {
        console.error(`- Could not find profile for ${item.name}. Skipping.`);
        continue;
      }

      const profile = profiles[0];

      // 2. Update Profile (Salary A, EPF, Branch, Join Date)
      await supabase.from('profiles').update({
        salary_a: item.salaryA,
        salary_b: 0,
        epf: item.epf,
        branch: item.branch,
        join_date: new Date(item.start).toISOString().split('T')[0]
      }).eq('id', profile.id);

      // 3. Manual Upsert: check for existing payroll record
      const { data: existing } = await supabase.from('payroll')
        .select('id')
        .eq('user_id', profile.id)
        .eq('month', month)
        .eq('year', year)
        .maybeSingle();

      const netSalary = item.salaryA - item.epf - item.advances - item.cover + item.intensive + item.travelling;

      const payrollData = {
        user_id: profile.id,
        branch: item.branch,
        month,
        year,
        salary_a: item.salaryA,
        salary_b: 0,
        epf: item.epf,
        advances: item.advances,
        cover: item.cover,
        intensive: item.intensive,
        travelling: item.travelling,
        net_salary: netSalary,
        status: 'Pending'
      };

      if (existing) {
        await supabase.from('payroll').update(payrollData).eq('id', existing.id);
        console.log(`✅ Updated: ${item.name} (Net: ${netSalary})`);
      } else {
        await supabase.from('payroll').insert(payrollData);
        console.log(`✅ Created: ${item.name} (Net: ${netSalary})`);
      }
    } catch (err) {
      console.error(`- Unexpected error for ${item.name}:`, err);
    }
  }

  console.log('Migration complete!');
}


migrate();
