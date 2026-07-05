import { PrismaClient, BrokerType, ArticleCategory, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Stockwise database...");

  // Create superuser - this is the main admin account
  const passwordHash = await bcrypt.hash("supsOwnItAll001", 12);
  await prisma.user.upsert({
    where: { email: "superuser@stockwise.ng" },
    update: {},
    create: {
      email: "superuser@stockwise.ng",
      firstName: "Super",
      lastName: "User",
      passwordHash,
      emailVerified: true,
      isOnboarded: true,
      role: Role.SUPERUSER,
    },
  });
  console.log("Superuser created: superuser@stockwise.ng / supsOwnItAll001");

  const brokers = [
    {
      slug: "meristem-securities",
      name: "Meristem Securities",
      type: BrokerType.TRADITIONAL,
      website: "https://www.meristem.com",
      referralLink: "https://www.meristem.com", // update with real affiliate link when formal agreement is signed
      shortDescription: "One of Nigeria's leading full-service investment firms with 20+ years of experience.",
      description: "Meristem Securities is one of Nigeria's leading investment and financial advisory firms. They offer a comprehensive suite of investment products including equities, fixed income, and mutual funds through their NGX-licensed platform. With over two decades of operation, Meristem is trusted by thousands of Nigerian investors for research-driven investment decisions and excellent client service.",
      secLicensed: true,
      secLicenseNumber: "SEC/REG/02/2001",
      yearsOperating: 20,
      minimumDeposit: 10000,
      tradingFeePercent: 1.35,
      accountOpeningFee: 0,
      supportedAssets: ["NGX Stocks", "ETFs", "Bonds", "Mutual Funds"],
      accountTypes: ["Individual", "Joint", "Corporate"],
      features: ["Mobile App", "Research Reports", "Portfolio Tracking", "Dividend Reinvestment"],
      isActive: true,
      isVerified: true,
      isFeatured: true,
      trustScore: 88,
      displayOrder: 1,
      requirements: [
        { item: "Valid Government-issued ID (NIN slip, voter's card, or international passport)", isRequired: true },
        { item: "BVN (Bank Verification Number)", isRequired: true },
        { item: "Utility bill (not older than 3 months)", isRequired: true },
        { item: "Passport photograph", isRequired: true },
      ],
    },
    {
      slug: "arm-securities",
      name: "ARM Securities",
      type: BrokerType.TRADITIONAL,
      website: "https://www.armsecurities.com.ng",
      referralLink: "https://www.armsecurities.com.ng",
      shortDescription: "25+ years of research-driven investment management across Nigerian markets.",
      description: "ARM Securities is a subsidiary of Asset & Resource Management Holding Company (ARM). With over 25 years of experience, ARM is known for research-driven investment decisions and strong asset management capabilities. They serve both retail and institutional investors with a reputation for transparency and integrity in the Nigerian capital market.",
      secLicensed: true,
      yearsOperating: 25,
      minimumDeposit: 5000,
      tradingFeePercent: 1.35,
      accountOpeningFee: 0,
      supportedAssets: ["NGX Stocks", "Bonds", "Mutual Funds"],
      accountTypes: ["Individual", "Corporate"],
      features: ["Research Reports", "Dedicated Relationship Manager", "Online Trading Platform"],
      isActive: true,
      isVerified: true,
      isFeatured: false,
      trustScore: 85,
      displayOrder: 2,
      requirements: [
        { item: "Valid Government-issued ID", isRequired: true },
        { item: "BVN", isRequired: true },
        { item: "Utility bill (not older than 3 months)", isRequired: true },
        { item: "Two passport photographs", isRequired: true },
      ],
    },
    {
      slug: "stanbic-ibtc-stockbrokers",
      name: "Stanbic IBTC Stockbrokers",
      type: BrokerType.TRADITIONAL,
      website: "https://www.stanbicibtc.com",
      referralLink: "https://www.stanbicibtc.com",
      shortDescription: "Institutional-grade stockbroking backed by Standard Bank Group.",
      description: "A subsidiary of Stanbic IBTC Holdings, one of Nigeria's largest financial institutions backed by Standard Bank Group. Offers institutional-grade services to retail investors with strong backing and regulatory compliance. Known for deep market research and access to both local and international investment products.",
      secLicensed: true,
      yearsOperating: 30,
      minimumDeposit: 20000,
      tradingFeePercent: 1.35,
      accountOpeningFee: 0,
      supportedAssets: ["NGX Stocks", "Bonds", "ETFs", "Foreign Stocks"],
      accountTypes: ["Individual", "Joint", "Corporate"],
      features: ["Mobile App", "Internet Banking Integration", "Research Reports", "24/7 Support"],
      isActive: true,
      isVerified: true,
      isFeatured: false,
      trustScore: 92,
      displayOrder: 3,
      requirements: [
        { item: "Valid Government-issued ID (NIN, passport, or driver's licence)", isRequired: true },
        { item: "BVN", isRequired: true },
        { item: "Utility bill or bank statement (not older than 3 months)", isRequired: true },
        { item: "Passport photograph", isRequired: true },
      ],
    },
    {
      slug: "cordros-securities",
      name: "Cordros Securities",
      type: BrokerType.TRADITIONAL,
      website: "https://www.cordros.com",
      referralLink: "https://www.cordros.com",
      shortDescription: "Transparent investment advisory and stockbroking for modern Nigerian investors.",
      description: "Cordros Securities Limited is a licensed dealing member of the Nigerian Exchange Group. They offer stockbroking, investment advisory, and research services with a reputation for transparency and investor education. Their online platform makes it easy for first-time investors to access the Nigerian capital market.",
      secLicensed: true,
      yearsOperating: 15,
      minimumDeposit: 5000,
      tradingFeePercent: 1.35,
      accountOpeningFee: 0,
      supportedAssets: ["NGX Stocks", "ETFs", "Fixed Income"],
      accountTypes: ["Individual", "Corporate"],
      features: ["Online Trading", "Research Reports", "Market Insights Newsletter"],
      isActive: true,
      isVerified: true,
      isFeatured: false,
      trustScore: 80,
      displayOrder: 4,
      requirements: [
        { item: "Valid Government-issued ID", isRequired: true },
        { item: "BVN", isRequired: true },
        { item: "Proof of address", isRequired: true },
        { item: "Passport photograph", isRequired: true },
      ],
    },
    {
      slug: "csl-stockbrokers",
      name: "CSL Stockbrokers",
      type: BrokerType.TRADITIONAL,
      website: "https://www.cslstockbrokers.com",
      referralLink: "https://www.cslstockbrokers.com",
      shortDescription: "FCMB Group's stockbroking arm offering retail and institutional services.",
      description: "CSL Stockbrokers is a leading capital market operator in Nigeria and a subsidiary of the FCMB Group. They provide retail and institutional stockbroking services with access to NGX equities. Their integration with FCMB banking makes fund transfers seamless for existing FCMB customers.",
      secLicensed: true,
      yearsOperating: 20,
      minimumDeposit: 10000,
      tradingFeePercent: 1.35,
      accountOpeningFee: 0,
      supportedAssets: ["NGX Stocks", "Bonds"],
      accountTypes: ["Individual", "Joint", "Corporate"],
      features: ["FCMB Banking Integration", "Portfolio Management", "Market Research"],
      isActive: true,
      isVerified: true,
      isFeatured: false,
      trustScore: 78,
      displayOrder: 5,
      requirements: [
        { item: "Valid Government-issued ID", isRequired: true },
        { item: "BVN", isRequired: true },
        { item: "Utility bill (not older than 3 months)", isRequired: true },
        { item: "Passport photograph", isRequired: true },
      ],
    },
    {
      slug: "afrinvest-securities",
      name: "Afrinvest Securities",
      type: BrokerType.TRADITIONAL,
      website: "https://www.afrinvest.com",
      referralLink: "https://www.afrinvest.com",
      shortDescription: "Premium investment banking and research for data-driven Nigerian investors.",
      description: "Afrinvest is one of Nigeria's most respected investment banking and securities firms. Known for deep market research and premium client service, they are a preferred choice for investors who value data-driven decisions. Afrinvest publishes widely-cited reports on the Nigerian economy and capital markets.",
      secLicensed: true,
      yearsOperating: 27,
      minimumDeposit: 50000,
      tradingFeePercent: 1.35,
      accountOpeningFee: 0,
      supportedAssets: ["NGX Stocks", "Bonds", "Eurobonds", "Private Equity"],
      accountTypes: ["Individual", "Corporate", "HNI"],
      features: ["Premium Research", "Relationship Managers", "Annual Investor Conference"],
      isActive: true,
      isVerified: true,
      isFeatured: false,
      trustScore: 86,
      displayOrder: 6,
      requirements: [
        { item: "Valid Government-issued ID", isRequired: true },
        { item: "BVN", isRequired: true },
        { item: "Utility bill or bank statement", isRequired: true },
        { item: "Two passport photographs", isRequired: true },
      ],
    },
    {
      slug: "united-capital-securities",
      name: "United Capital Securities",
      type: BrokerType.TRADITIONAL,
      website: "https://www.unitedcapitalplcgroup.com",
      referralLink: "https://www.unitedcapitalplcgroup.com",
      shortDescription: "Pan-African financial services with a modern digital trading platform.",
      description: "United Capital Securities is the stockbroking arm of United Capital Plc, a pan-African financial services group. They offer a blend of traditional expertise and modern digital tools, making them accessible to both first-time and experienced investors across the Nigerian capital market.",
      secLicensed: true,
      yearsOperating: 18,
      minimumDeposit: 10000,
      tradingFeePercent: 1.35,
      accountOpeningFee: 0,
      supportedAssets: ["NGX Stocks", "Bonds", "Mutual Funds"],
      accountTypes: ["Individual", "Joint", "Corporate"],
      features: ["Online Platform", "Investment Research", "Portfolio Advisory"],
      isActive: true,
      isVerified: true,
      isFeatured: false,
      trustScore: 81,
      displayOrder: 7,
      requirements: [
        { item: "Valid Government-issued ID", isRequired: true },
        { item: "BVN", isRequired: true },
        { item: "Proof of address", isRequired: true },
        { item: "Passport photograph", isRequired: true },
      ],
    },
    {
      slug: "cardinalstone-securities",
      name: "CardinalStone Securities",
      type: BrokerType.TRADITIONAL,
      website: "https://www.cardinalstone.com",
      referralLink: "https://www.cardinalstone.com",
      shortDescription: "Indigenous investment banking with strong equities research and client focus.",
      description: "CardinalStone is an indigenous investment banking and asset management firm known for its strong equities research and client-focused services in the Nigerian capital market. They consistently publish well-regarded investment research that helps clients make informed decisions.",
      secLicensed: true,
      yearsOperating: 16,
      minimumDeposit: 10000,
      tradingFeePercent: 1.35,
      accountOpeningFee: 0,
      supportedAssets: ["NGX Stocks", "Fixed Income", "Mutual Funds"],
      accountTypes: ["Individual", "Corporate"],
      features: ["Equity Research", "Online Trading", "Investment Advisory"],
      isActive: true,
      isVerified: true,
      isFeatured: false,
      trustScore: 79,
      displayOrder: 8,
      requirements: [
        { item: "Valid Government-issued ID", isRequired: true },
        { item: "BVN", isRequired: true },
        { item: "Proof of address", isRequired: true },
        { item: "Passport photograph", isRequired: true },
      ],
    },
    {
      slug: "chaka",
      name: "Chaka",
      type: BrokerType.DIGITAL,
      website: "https://www.chaka.ng",
      // Chaka has an enterprise referral program - update this with your actual affiliate link
      referralLink: "https://www.chaka.ng",
      shortDescription: "Nigeria's first licensed app for both NGX and US stock market access.",
      description: "Chaka is Nigeria's first licensed investment app offering access to both local NGX stocks and international markets (NYSE, NASDAQ). Built for the mobile-first generation, Chaka makes investing as easy as online shopping. Their enterprise API also allows platforms to embed investment features.",
      secLicensed: true,
      yearsOperating: 5,
      minimumDeposit: 100,
      tradingFeePercent: 1.5,
      accountOpeningFee: 0,
      supportedAssets: ["NGX Stocks", "US Stocks", "ETFs"],
      accountTypes: ["Individual"],
      features: ["Mobile App (iOS & Android)", "US Market Access", "Fractional Shares", "Instant KYC"],
      isActive: true,
      isVerified: true,
      isFeatured: true,
      trustScore: 82,
      displayOrder: 9,
      requirements: [
        { item: "NIN or BVN", isRequired: true, note: "Fully digital verification - no paperwork" },
        { item: "Selfie for identity verification", isRequired: true },
        { item: "Nigerian bank account", isRequired: true },
      ],
    },
    {
      slug: "bamboo",
      name: "Bamboo",
      type: BrokerType.DIGITAL,
      website: "https://www.investbamboo.com",
      // Bamboo has an active retail referral program - update with your unique affiliate link from the app
      referralLink: "https://www.investbamboo.com",
      shortDescription: "Seamless access to US stocks and ETFs with a clean, beginner-friendly app.",
      description: "Bamboo gives Nigerians seamless access to US stocks and ETFs on NYSE and NASDAQ. Known for its clean, intuitive interface and low-friction onboarding, Bamboo is a top choice for digitally-savvy young investors. Their referral program rewards both referrer and new user when the account is funded.",
      secLicensed: true,
      yearsOperating: 5,
      minimumDeposit: 1000,
      tradingFeePercent: 1.5,
      accountOpeningFee: 0,
      supportedAssets: ["US Stocks", "ETFs"],
      accountTypes: ["Individual"],
      features: ["Mobile App (iOS & Android)", "US Market Access", "Fractional Shares", "Dollar Wallet"],
      isActive: true,
      isVerified: true,
      isFeatured: true,
      trustScore: 80,
      displayOrder: 10,
      requirements: [
        { item: "NIN or BVN", isRequired: true, note: "Fully digital verification" },
        { item: "Selfie for facial verification", isRequired: true },
        { item: "Nigerian bank account", isRequired: true },
      ],
    },
    {
      slug: "trove-finance",
      name: "Trove Finance",
      type: BrokerType.DIGITAL,
      website: "https://www.troveapp.com",
      // Trove has a "free stock" referral program - update with your unique affiliate link from the app
      referralLink: "https://www.troveapp.com",
      shortDescription: "Goal-based investing in Nigerian and US stocks with free shares on referral.",
      description: "Trove Finance is a Nigerian investment app enabling access to both Nigerian and US markets. Popular among first-time investors for its goal-based investing features and beginner-friendly interface. Their referral program gives both you and new users free shares when they complete KYC.",
      secLicensed: true,
      yearsOperating: 5,
      minimumDeposit: 1000,
      tradingFeePercent: 1.5,
      accountOpeningFee: 0,
      supportedAssets: ["NGX Stocks", "US Stocks", "ETFs"],
      accountTypes: ["Individual"],
      features: ["Mobile App (iOS & Android)", "Goal-based Investing", "Educational Content", "US & NG Market Access"],
      isActive: true,
      isVerified: true,
      isFeatured: true,
      trustScore: 78,
      displayOrder: 11,
      requirements: [
        { item: "NIN or BVN", isRequired: true, note: "Digital verification only" },
        { item: "Selfie photo", isRequired: true },
        { item: "Nigerian bank account", isRequired: true },
      ],
    },
  ];

  for (const brokerData of brokers) {
    const { requirements, ...fields } = brokerData;
    const broker = await prisma.broker.upsert({
      where: { slug: brokerData.slug },
      update: fields,
      create: fields,
    });
    await prisma.brokerRequirement.deleteMany({ where: { brokerId: broker.id } });
    await prisma.brokerRequirement.createMany({
      data: requirements.map((r) => ({ ...r, brokerId: broker.id })),
    });
    console.log("Seeded broker:", broker.name);
  }

  // Seed first 3 lessons
  const lessons = [
    {
      slug: "what-is-investing",
      lessonNumber: 1,
      title: "What Is Investing?",
      excerpt: "Understand what investing means, why it matters, and how it is different from saving - in plain, everyday language.",
      category: ArticleCategory.LESSON,
      readingTime: 8,
      isPublished: true,
      publishedAt: new Date(),
      tags: ["beginner", "investing-basics", "money"],
      content: `## What Is Investing?

Let's start from the very beginning - no jargon, no assumptions.

### The Simple Version

Investing means putting your money to work so it can grow over time.

When you save money in a bank, it just sits there (earning a tiny bit of interest). When you invest, you are using that money to buy something - like a share in a company - with the expectation that it will be worth more in the future.

### A Real Nigerian Example

Imagine your friend starts a suya business. You give him 50,000 naira to help him buy equipment. In return, he gives you 10% ownership of the business.

Six months later, the business is booming and worth 800,000 naira. Your 10% stake is now worth 80,000 naira. You have turned 50,000 into 80,000 - that is investing.

The Nigerian Stock Exchange works the same way, just more formal, regulated, and accessible to everyone.

### Why Should You Invest?

1. **Inflation eats your savings.** If inflation is 22% and your bank pays 6% interest, you are actually losing money by saving.
2. **Wealth compounds.** Small amounts invested consistently grow dramatically over time.
3. **You deserve a financial future.** Investing is how ordinary people build extraordinary wealth over time.

### What You Will Learn in This Course

Over the next 9 lessons, we will walk you through everything you need to go from "I have money to invest" to "I have made my first investment." Let us go.`,
    },
    {
      slug: "understanding-stocks",
      lessonNumber: 2,
      title: "Understanding Stocks and Shares",
      excerpt: "What exactly is a stock? What does it mean to own a share of a company? We break it down simply.",
      category: ArticleCategory.LESSON,
      readingTime: 10,
      isPublished: true,
      publishedAt: new Date(),
      tags: ["stocks", "shares", "beginner", "NGX"],
      content: `## Understanding Stocks and Shares

### What Is a Stock?

A stock (also called a share or equity) is a small piece of ownership in a company.

When a company like Dangote Cement wants to raise money to expand, it does not just go to the bank. It can split itself into millions of tiny pieces and sell those pieces to the public. Each piece is a "share."

If you buy one share of Dangote Cement, you own a tiny fraction of that company. You get to benefit when the company does well - and you bear some risk when it does not.

### What Do You Actually Own?

When you own shares, you:
- **Earn dividends** - a portion of the company's profits paid to shareholders
- **Benefit from price appreciation** - if the share price goes up, your investment is worth more
- **Have voting rights** - on major company decisions (usually at Annual General Meetings)

### Nigerian Stock Exchange (NGX) - Home of Nigerian Stocks

The Nigerian Exchange Group (NGX) is where Nigerian company stocks are bought and sold. Think of it like a giant marketplace - except instead of buying yam or fabric, you are buying tiny pieces of companies like:

- **GTCO** (Guaranty Trust Holding Company)
- **MTN Nigeria** (the telco you probably use)
- **Dangote Cement** (the largest cement company in Africa)
- **Zenith Bank**

### How Do You Make Money?

Two main ways:

1. **Buy low, sell high.** You buy a share at 20 naira. It rises to 35 naira. You sell. You made 15 naira per share.
2. **Dividends.** The company distributes profits to shareholders. You get paid just for holding the shares.

Next lesson, we will go deeper into how the NGX actually works.`,
    },
    {
      slug: "understanding-ngx",
      lessonNumber: 3,
      title: "Understanding the Nigerian Exchange (NGX)",
      excerpt: "How does the Nigerian stock market actually work? What happens when you buy or sell a share?",
      category: ArticleCategory.LESSON,
      readingTime: 9,
      isPublished: true,
      publishedAt: new Date(),
      tags: ["NGX", "stock-exchange", "beginner", "Nigeria"],
      content: `## Understanding the Nigerian Exchange (NGX)

### What Is the NGX?

The Nigerian Exchange Group (NGX) - formerly known as the Nigerian Stock Exchange (NSE) - is Nigeria's primary securities exchange. It is headquartered in Lagos and has been operating since 1960.

It is the regulated marketplace where buyers and sellers of Nigerian company stocks meet.

### How Does Trading Work?

Here is the simple flow:

1. **You decide** to buy 100 shares of MTN Nigeria
2. **You instruct your broker** (the licensed middleman - more on this in Lesson 4)
3. **The broker places the order** on the NGX trading system
4. **A seller is matched** with your buy order
5. **The trade is settled** within T+3 days (3 business days after the trade)
6. **The shares appear** in your CSCS account (your stock wallet)

### What Is CSCS?

Central Securities Clearing System (CSCS) is where your shares are actually stored digitally. Think of it as your "stock wallet." Every investor has a CHN (Clearing House Number) which is your unique ID on CSCS.

Your broker helps you get your CHN when you open an account.

### NGX Trading Hours

The NGX operates Monday to Friday:
- Pre-open session: 9:30 AM to 10:00 AM
- Open session (trading): 10:00 AM to 2:30 PM
- Closed: Weekends and Nigerian public holidays

### What Can You Buy on NGX?

- **Equities** - company shares (the most common)
- **ETFs** - Exchange Traded Funds (baskets of stocks)
- **Bonds** - government and corporate debt instruments

Next lesson: the most important person in your investing journey - your stockbroker.`,
    },
  ];

  for (const article of lessons) {
    await prisma.article.upsert({
      where: { slug: article.slug },
      update: article,
      create: article,
    });
    console.log("Seeded article:", article.title);
  }

  console.log("\nDatabase seeded successfully!");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
