import { z } from "zod";

export const passwordSchema = z
  .string()
  .min(8, "Нууц үг дор хаяж 8 тэмдэгт байх ёстой")
  .regex(/[A-Z]/, "Дор хаяж нэг том үсэг агуулсан байх ёстой (A-Z)")
  .regex(/[0-9]/, "Дор хаяж нэг тоо агуулсан байх ёстой (0-9)")
  .regex(/[^A-Za-z0-9]/, "Дор хаяж нэг тусгай тэмдэгт агуулсан байх ёстой (!@#$ гэх мэт)");

export function checkPasswordStrength(password: string): {
  score: number;
  checks: { label: string; pass: boolean }[];
} {
  const checks = [
    { label: "Дор хаяж 8 тэмдэгт", pass: password.length >= 8 },
    { label: "Том үсэг (A-Z)", pass: /[A-Z]/.test(password) },
    { label: "Тоо (0-9)", pass: /[0-9]/.test(password) },
    { label: "Тусгай тэмдэгт (!@#$...)", pass: /[^A-Za-z0-9]/.test(password) },
  ];
  const score = checks.filter((c) => c.pass).length;
  return { score, checks };
}
