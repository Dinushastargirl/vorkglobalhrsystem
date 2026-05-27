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
  { branch: "Borella", name: "Dahami Divyanjali", start: "6/5/2024", salaryA: 27000, epf: 2400, advances: 0, cover: 0, intensive: 1000, travelling: 4550 },
  { branch: "Borella", name: "Achini Vindya", start: "2/22/2024", salaryA: 30000, epf: 2400, advances: 0, cover: 0, intensive: 2000, travelling: 3180 },
  { branch: "Dehiwela", name: "Dilini Sanarathna", start: "3/4/2026", salaryA: 35000, epf: 0, advances: 0, cover: 0, intensive: 0, travelling: 2880 },
  { branch: "Dematagoda", name: "Chamilka Botheju", start: "8/2/2002", salaryA: 32000, epf: 2400, advances: 0, cover: 0, intensive: 8000, travelling: 0 },
  { branch: "Dematagoda", name: "A.V. Chamika Sonali", start: "1/12/2026", salaryA: 27000, epf: 2400, advances: 0, cover: 0, intensive: 0, travelling: 3360 },
  { branch: "Homagama", name: "D.A. Dilupa Thamari", start: "9/1/2002", salaryA: 29000, epf: 2400, advances: 0, cover: 0, intensive: 8000, travelling: 0 },
  { branch: "Homagama", name: "Harsha Thamali", start: "9/1/2017", salaryA: 27000, epf: 2400, advances: 28100, cover: 0, intensive: 3500, travelling: 0 },
  { branch: "Kadawatha", name: "Sachini Nirasha", start: "7/1/2022", salaryA: 30000, epf: 2400, advances: 0, cover: 0, intensive: 1500, travelling: 0 },
  { branch: "Kadawatha", name: "Chaseera Sulani", start: "3/12/2024", salaryA: 27000, epf: 2400, advances: 0, cover: 0, intensive: 500, travelling: 0 },
  { branch: "Kirbathgoda", name: "Geethangani Pieris", start: "1/9/2019", salaryA: 30000, epf: 2400, advances: 0, cover: 10000, intensive: 3000, travelling: 3900 },
  { branch: "Kirbathgoda", name: "W.K. Erandi Perera", start: "2/3/2026", salaryA: 27000, epf: 2400, advances: 0, cover: 0, intensive: 0, travelling: 1440 },
  { branch: "Kottawa", name: "W.A. Chandima Dilrukishi", start: "1/6/2015", salaryA: 28000, epf: 2400, advances: 0, cover: 0, intensive: 5000, travelling: 0 },
  { branch: "Kottawa", name: "Rasika Priyangani", start: "2/7/2017", salaryA: 34000, epf: 2400, advances: 0, cover: 0, intensive: 4000, travelling: 1000 },
  { branch: "Office", name: "A.M.N.Sanjana", start: "3/1/1997", salaryA: 29750, epf: 2400, advances: 0, cover: 0, intensive: 8000, travelling: 0 },
  { branch: "Office", name: "R.P. Ratnayake", start: "1/1/1992", salaryA: 27500, epf: 0, advances: 0, cover: 0, intensive: 0, travelling: 0 },
  { branch: "Office", name: "Nihal Malawana", start: "1/1/1992", salaryA: 34500, epf: 0, advances: 0, cover: 0, intensive: 0, travelling: 10780 },
  { branch: "Office", name: "Syamalie Udumulla", start: "1/1/2000", salaryA: 11000, epf: 0, advances: 0, cover: 0, intensive: 0, travelling: 0 },
  { branch: "Office", name: "Nishanthi Kuruppu", start: "7/10/1997", salaryA: 33200, epf: 2400, advances: 0, cover: 0, intensive: 8000, travelling: 2000 },
  { branch: "Office", name: "Nadeesha Dilhara", start: "11/10/2022", salaryA: 38000, epf: 2400, advances: 0, cover: 0, intensive: 1500, travelling: 1875 },
  { branch: "Office", name: "Chathurika Madushani", start: "1/12/2026", salaryA: 27000, epf: 2400, advances: 0, cover: 0, intensive: 0, travelling: 2990 },
  { branch: "Panadura", name: "Maneesha H. Dias", start: "1/25/2016", salaryA: 35000, epf: 2400, advances: 0, cover: 0, intensive: 4500, travelling: 1620 },
  { branch: "Panadura", name: "Imashi Pramodaya", start: "11/26/2025", salaryA: 27000, epf: 2400, advances: 0, cover: 0, intensive: 0, travelling: 2025 },
  { branch: "W2", name: "Aruni Indrachapa", start: "11/3/2022", salaryA: 27000, epf: 2400, advances: 0, cover: 0, intensive: 1000, travelling: 0 },
  { branch: "W2", name: "Tharushi Sadurnin", start: "12/9/2025", salaryA: 27000, epf: 2400, advances: 0, cover: 0, intensive: 0, travelling: 3000 },
  { branch: "W3", name: "Lakshika Perera", start: "9/1/2017", salaryA: 27000, epf: 2400, advances: 0, cover: 0, intensive: 3500, travelling: 2000 },
  { branch: "W3", name: "Tharushi Apsara", start: "7/22/2025", salaryA: 27000, epf: 2400, advances: 0, cover: 0, intensive: 0, travelling: 0 },
  { branch: "W4", name: "D.M. Nilukshi Kawshalya", start: "1/7/2013", salaryA: 29000, epf: 2400, advances: 0, cover: 0, intensive: 5500, travelling: 4650 },
  { branch: "W4", name: "Dulki Isanka", start: "4/4/2022", salaryA: 27000, epf: 2400, advances: 0, cover: 0, intensive: 1500, travelling: 0 }
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
