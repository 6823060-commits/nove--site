# Шөнийн Новел — Монгол тууж унших платформ

Next.js (App Router) + Prisma + PostgreSQL дээр баригдсан, олон тууж/роман унших боломжтой веб платформ. Хэрэглэгчийн бүртгэл, дуртай зохиол хадгалах, бүлэг тутамд сэтгэгдэл бичих, мөн зохиол/бүлэг удирдах Admin самбартай.

## Технологи

- **Next.js 16** (App Router, TypeScript)
- **Prisma ORM** (`@prisma/adapter-pg` драйверээр PostgreSQL-д шууд холбогддог)
- **PostgreSQL**
- **NextAuth.js (Auth.js v5)** — имэйл/нууц үгээр нэвтрэх, JWT сешн
- **Tailwind CSS v4**
- Self-hosted фонт: Playfair Display, Inter, Noto Serif (Кирилл дэмжлэгтэй)

## Боломжууд

- Новел жагсаалт, хайлт, төрөл/төлөвөөр шүүх, хуудаслалт
- Зохиолын дэлгэрэнгүй хуудас, бүлгийн жагсаалт
- Бүлэг унших хуудас — өмнөх/дараах бүлэг рүү шилжих, унших явцын зурвас (progress bar)
- Бүртгэл/нэвтрэх (имэйл + нууц үг)
- Дуртай зохиол хадгалах (favorite)
- Зохиол болон бүлэг тус бүрд сэтгэгдэл бичих/устгах
- Уншсан түүх автоматаар хадгалагдаж, "Үргэлжлүүлэн унших" функц ажилладаг
- **Admin самбар**: шинэ тууж/бүлэг нэмэх, засах, устгах, төрөл нэмэх, статистик харах

## Эхлэхэд бэлтгэх

### 1. Хамаарлуудыг суулгах

```bash
npm install
```

(`postinstall` script автоматаар `prisma generate` ажиллуулна)

### 2. PostgreSQL өгөгдлийн сан бэлтгэх

Локал дээрээ PostgreSQL суулгасан бол:

```bash
createuser novelapp -P   # нууц үг асуух үед өөрөө сонгоно уу
createdb noveldb -O novelapp
```

Эсвэл [Neon](https://neon.tech), [Supabase](https://supabase.com), [Railway](https://railway.app) зэрэг үнэгүй PostgreSQL hosting ашиглаж болно.

### 3. `.env` файл үүсгэх

`.env.example`-ийг хуулж `.env` нэрээр хадгалаад, өөрийн мэдээллээр бөглөнө үү:

```bash
cp .env.example .env
```

```
DATABASE_URL="postgresql://novelapp:НУУЦ_ҮГ@localhost:5432/noveldb?schema=public"
AUTH_SECRET="openssl rand -base64 32 командаар үүсгэсэн утга"
NEXTAUTH_SECRET="дээрхтэй ижил утга"
NEXTAUTH_URL="http://localhost:3000"
```

### 4. Хүснэгтүүдийг үүсгэх

```bash
npx prisma migrate dev
```

Энэ нь `prisma/migrations` дотор бэлэн байгаа migration-ийг таны өгөгдлийн санд хэрэгжүүлнэ.

### 5. Жишээ өгөгдөл нэмэх (заавал биш, гэхдээ санал болгож байна)

```bash
npm run db:seed
```

Энэ скрипт дараах зүйлсийг үүсгэнэ:
- Admin хэрэглэгч: `admin@novel.mn` / `admin123`
- Энгийн хэрэглэгч: `user@novel.mn` / `user123`
- 8 төрөл, 5 тууж, нийт 20 бүлэг жишээ агуулга

### 6. Сервер ажиллуулах

```bash
npm run dev
```

`http://localhost:3000` хаягаар нээнэ үү.

## Файлын бүтэц (товч)

```
src/
  app/                    Next.js App Router хуудсууд
    novels/[slug]/[chapterNumber]   Бүлэг унших хуудас
    admin/                Admin самбар
    api/                  REST API route-ууд
  components/             UI компонентууд
    admin/                Admin-д зориулсан форм/компонент
  lib/
    prisma.ts             Prisma Client singleton (pg driver adapter)
    auth.ts                NextAuth тохиргоо
    format.ts, slugify.ts  Туслах функцууд
  proxy.ts                Route хамгаалалт (admin/profile)
prisma/
  schema.prisma           Өгөгдлийн сангийн схем
  migrations/              SQL migration-ууд
  seed.ts                 Жишээ өгөгдөл оруулах script
```

## Шинэ зохиол/бүлэг нэмэх

1. `admin@novel.mn` бүртгэлээр нэвтэрнэ
2. Баруун дээд буланд "Удирдлага" холбоос гарч ирнэ → `/admin`
3. "Шинэ тууж" товчоор зохиол үүсгээд, дараа нь түүн дотроос "Шинэ бүлэг" нэмнэ

## Деплой хийх

Vercel дээр деплой хийхдээ дараах зүйлсийг анхаарна уу:

- `DATABASE_URL`, `AUTH_SECRET`/`NEXTAUTH_SECRET`, `NEXTAUTH_URL` орчны хувьсагчдыг тохируулна
- PostgreSQL нь Vercel-ийн сервертэй холбогдох боломжтой байх ёстой (жишээ нь Neon, Supabase зэрэг managed PostgreSQL ашиглах нь хамгийн хялбар)
- Build хийхээс өмнө `npx prisma migrate deploy` ажиллуулж шинэ орчны өгөгдлийн санд схемээ оруулна
