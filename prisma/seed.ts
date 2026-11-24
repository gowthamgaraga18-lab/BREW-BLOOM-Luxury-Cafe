import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { IMG } from "@/data/images";

async function main() {
  console.log("Seeding Brew & Bloom…");

  // Clean (order matters for FK)
  await db.orderItem.deleteMany();
  await db.order.deleteMany();
  await db.reservation.deleteMany();
  await db.contactMessage.deleteMany();
  await db.newsletterSubscriber.deleteMany();
  await db.discountCode.deleteMany();
  await db.product.deleteMany();
  await db.category.deleteMany();
  await db.adminUser.deleteMany();
  await db.customer.deleteMany();

  // Categories
  const categories = await Promise.all(
    [
      { name: "Signature Coffee", slug: "signature-coffee", order: 1, description: "House-defining cups, built on single-origin espresso and patient technique." },
      { name: "Hot Coffee", slug: "hot-coffee", order: 2, description: "The classics, pulled with precision and served at their peak." },
      { name: "Cold Coffee", slug: "cold-coffee", order: 3, description: "Slow-chilled, layered and made for long afternoons." },
      { name: "Tea", slug: "tea", order: 4, description: "Whole-leaf infusions and ceremonial-grade matcha." },
      { name: "Desserts", slug: "desserts", order: 5, description: "Pastry-led indulgences made in-house each morning." },
      { name: "Bakery", slug: "bakery", order: 6, description: "Laminated doughs and warm, fragrant loaves from our oven." },
      { name: "Special Collections", slug: "special-collections", order: 7, description: "Limited roasts, reserves and seasonal signatures." },
    ].map((c) => db.category.create({ data: c }))
  );
  const cat = (slug: string) => categories.find((c) => c.slug === slug)!;

  type Seed = {
    name: string;
    slug: string;
    category: string;
    price: number;
    description: string;
    image: string;
    available: boolean;
    vegetarian: boolean;
    featured: boolean;
    rating: number;
  };

  const pick = (key: string, i: number) => IMG[key]?.[i] ?? IMG.cafe_interior?.[i] ?? "";

  const products: Seed[] = [
    // Signature
    { name: "Brew & Bloom Signature Latte", slug: "brew-bloom-signature-latte", category: "signature-coffee", price: 240, image: pick("sig_lattes", 0), featured: true, available: true, vegetarian: true, rating: 4.9,
      description: "Our house espresso layered with silky steamed milk and a whisper of brown sugar, finished with a single rosetta. The cup that defines us." },
    { name: "Golden Caramel Macchiato", slug: "golden-caramel-macchiato", category: "signature-coffee", price: 260, image: pick("sig_lattes", 1), featured: true, available: true, vegetarian: true, rating: 4.8,
      description: "Slow-cooked golden caramel, double espresso and velveted milk, crowned with a delicate salted crema." },
    { name: "Hazelnut Velvet Mocha", slug: "hazelnut-velvet-mocha", category: "signature-coffee", price: 250, image: pick("sig_lattes", 2), featured: true, available: true, vegetarian: true, rating: 4.8,
      description: "Single-origin cocoa and toasted hazelnut praline met with espresso and microfoam — dessert in a cup." },
    // Hot
    { name: "Espresso", slug: "espresso", category: "hot-coffee", price: 120, image: pick("espresso", 0), featured: false, available: true, vegetarian: true, rating: 4.7,
      description: "A dense, syrupy double shot with a persistent golden crema. Pure and uncompromising." },
    { name: "Cappuccino", slug: "cappuccino", category: "hot-coffee", price: 160, image: pick("cappuccino", 0), featured: false, available: true, vegetarian: true, rating: 4.7,
      description: "Equal parts espresso, steamed milk and dense foam — balanced, classic, exact." },
    { name: "Café Latte", slug: "cafe-latte", category: "hot-coffee", price: 180, image: pick("cappuccino", 1), featured: false, available: true, vegetarian: true, rating: 4.7,
      description: "A long, comforting pull of espresso cradled in smooth steamed milk with a soft foam crown." },
    { name: "Americano", slug: "americano", category: "hot-coffee", price: 150, image: pick("espresso", 1), featured: false, available: true, vegetarian: true, rating: 4.6,
      description: "Espresso lengthened with hot water for a clean, aromatic cup with a gentle body." },
    { name: "Flat White", slug: "flat-white", category: "hot-coffee", price: 170, image: pick("cappuccino", 2), featured: false, available: true, vegetarian: true, rating: 4.7,
      description: "Ristretto shots and thin, glossy microfoam — intense, integrated and endlessly drinkable." },
    { name: "Mocha", slug: "mocha", category: "hot-coffee", price: 200, image: pick("sig_lattes", 3), featured: false, available: true, vegetarian: true, rating: 4.6,
      description: "Espresso, Belgian dark chocolate and steamed milk, finished with a dusting of raw cacao." },
    // Cold
    { name: "Iced Spanish Latte", slug: "iced-spanish-latte", category: "cold-coffee", price: 230, image: pick("iced_spanish", 0), featured: false, available: true, vegetarian: true, rating: 4.8,
      description: "Condensed milk, espresso and chilled milk poured over ice for a layered, dessert-like indulgence." },
    { name: "Cold Coffee", slug: "cold-coffee", category: "cold-coffee", price: 180, image: pick("iced_spanish", 1), featured: false, available: true, vegetarian: true, rating: 4.6,
      description: "Slow-dripped cold brew blended with milk and ice — smooth, low-acid and refreshing." },
    { name: "Caramel Frappe", slug: "caramel-frappe", category: "cold-coffee", price: 220, image: pick("frappe", 0), featured: true, available: true, vegetarian: true, rating: 4.8,
      description: "Espresso, caramel and milk blended to a silken frost, crowned with whipped cream and a caramel lattice." },
    { name: "Iced Americano", slug: "iced-americano", category: "cold-coffee", price: 150, image: pick("iced_spanish", 2), featured: false, available: true, vegetarian: true, rating: 4.5,
      description: "Espresso over cold water and ice — bright, clean and bracing." },
    { name: "Iced Mocha", slug: "iced-mocha", category: "cold-coffee", price: 210, image: pick("iced_spanish", 3), featured: false, available: true, vegetarian: true, rating: 4.6,
      description: "Chilled espresso, dark chocolate and milk over ice with a whipped cream finish." },
    // Tea
    { name: "Masala Chai", slug: "masala-chai", category: "tea", price: 90, image: pick("tea", 0), featured: false, available: true, vegetarian: true, rating: 4.6,
      description: "Assam tea simmered with whole milk, cardamom, ginger and a blend of warming spices." },
    { name: "Earl Grey", slug: "earl-grey", category: "tea", price: 140, image: pick("tea", 1), featured: false, available: true, vegetarian: true, rating: 4.5,
      description: "Bergamot-kissed black whole-leaf tea, steeped strong and served with a slice of lemon." },
    { name: "Chamomile Infusion", slug: "chamomile-infusion", category: "tea", price: 130, image: pick("tea", 2), featured: false, available: true, vegetarian: true, rating: 4.4,
      description: "Whole chamomile blossoms and a touch of honey — a calm, golden cup for unhurried evenings." },
    { name: "Matcha Latte", slug: "matcha-latte", category: "tea", price: 220, image: pick("matcha", 0), featured: true, available: true, vegetarian: true, rating: 4.8,
      description: "Ceremonial-grade Uji matcha whisked with steamed milk — grassy, umami and luminous green." },
    // Desserts
    { name: "Blueberry Cheesecake", slug: "blueberry-cheesecake", category: "desserts", price: 220, image: pick("cheesecake", 0), featured: true, available: true, vegetarian: true, rating: 4.9,
      description: "New-York-style baked cheesecake on a buttered biscuit base, glossed with wild blueberry compote." },
    { name: "Chocolate Brownie", slug: "chocolate-brownie", category: "desserts", price: 150, image: pick("brownie", 0), featured: false, available: true, vegetarian: true, rating: 4.7,
      description: "Fudgy 70% dark chocolate brownie with a crackled top and a molten centre. Served warm." },
    { name: "Tiramisu", slug: "tiramisu", category: "desserts", price: 250, image: pick("tiramisu", 0), featured: true, available: true, vegetarian: true, rating: 4.9,
      description: "Espresso-soaked savoiardi layered with mascarpone cream and dusted with single-origin cocoa." },
    { name: "Red Velvet Cake", slug: "red-velvet-cake", category: "desserts", price: 210, image: pick("redvelvet", 0), featured: false, available: true, vegetarian: true, rating: 4.7,
      description: "Cocoa-tinged velvet sponge with tangy cream cheese frosting and a delicate crumb." },
    // Bakery
    { name: "Butter Croissant", slug: "butter-croissant", category: "bakery", price: 130, image: pick("croissant", 0), featured: false, available: true, vegetarian: true, rating: 4.7,
      description: "Twenty-seven layers of laminated French butter dough, baked to a deep golden honeycomb." },
    { name: "Chocolate Croissant", slug: "chocolate-croissant", category: "bakery", price: 160, image: pick("croissant", 1), featured: false, available: true, vegetarian: true, rating: 4.7,
      description: "Pain au chocolat with two batons of 64% dark chocolate folded into flaky butter layers." },
    { name: "Garlic Bread", slug: "garlic-bread", category: "bakery", price: 140, image: pick("garlicbread", 0), featured: false, available: true, vegetarian: true, rating: 4.5,
      description: "House sourdough brushed with roasted garlic butter, herbs and shaved parmesan, toasted crisp." },
    { name: "Cinnamon Roll", slug: "cinnamon-roll", category: "bakery", price: 170, image: pick("cinnamon", 0), featured: false, available: true, vegetarian: true, rating: 4.7,
      description: "Pillowy brioche spiralled with Saigon cinnamon sugar and draped in cream cheese glaze." },
    // Special Collections
    { name: "Single Origin Ethiopia", slug: "single-origin-ethiopia", category: "special-collections", price: 280, image: pick("beansbag", 0), featured: true, available: true, vegetarian: true, rating: 4.9,
      description: "A washed Yirgacheffe with notes of jasmine, bergamot and stone fruit. Brewed as a delicate pour-over." },
    { name: "Cold Brew Reserve", slug: "cold-brew-reserve", category: "special-collections", price: 260, image: pick("iced_spanish", 4), featured: false, available: true, vegetarian: true, rating: 4.8,
      description: "Eighteen-hour steeped cold brew from our reserve blend — chocolatey, syrupy and remarkably smooth." },
    { name: "Chocolate Fondant", slug: "chocolate-fondant", category: "special-collections", price: 240, image: pick("chocplate", 0), featured: true, available: true, vegetarian: true, rating: 4.9,
      description: "A molten 70% Valrhona centre in a baked chocolate shell, served with vanilla bean cream." },
    { name: "Affogato Al Caffè", slug: "affogato-al-caffe", category: "special-collections", price: 200, image: pick("espresso", 2), featured: false, available: true, vegetarian: true, rating: 4.8,
      description: "A scoop of Madagascan vanilla gelato drowned in a fresh double espresso. Simple, sublime." },
  ];

  for (const p of products) {
    await db.product.create({
      data: {
        name: p.name,
        slug: p.slug,
        categoryId: cat(p.category).id,
        price: p.price,
        description: p.description,
        image: p.image,
        available: p.available,
        vegetarian: p.vegetarian,
        featured: p.featured,
        rating: p.rating,
      },
    });
  }
  console.log(`Created ${products.length} products.`);

  // Admin user
  const adminEmail = process.env.ADMIN_BOOTSTRAP_EMAIL ?? "admin@brewbloom.cafe";
  const adminPass = process.env.ADMIN_BOOTSTRAP_PASSWORD ?? "BrewBloom@2025";
  await db.adminUser.create({
    data: {
      email: adminEmail,
      passwordHash: hashPassword(adminPass),
      name: "Brew & Bloom Admin",
      role: "superadmin",
    },
  });
  console.log(`Created admin: ${adminEmail}`);

  // Discount codes
  await db.discountCode.createMany({
    data: [
      { code: "BLOOM10", percentage: 10, active: true, minSubtotal: 0 },
      { code: "WEEKEND15", percentage: 15, active: true, minSubtotal: 300 },
      { code: "FREESHIP", flatAmount: 40, active: true, minSubtotal: 0 },
      { code: "BLOOM100", flatAmount: 100, active: true, minSubtotal: 800 },
    ],
  });
  console.log("Created discount codes.");

  // Sample reservations
  const today = new Date();
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  const inDays = (n: number) => { const d = new Date(today); d.setDate(d.getDate() + n); return fmt(d); };
  await db.reservation.createMany({
    data: [
      { name: "Anaïs Verma", email: "anais@example.com", phone: "+91 9800011111", date: inDays(1), time: "19:30", guests: 2, specialRequests: "Anniversary — a quiet corner if possible.", status: "confirmed" },
      { name: "Rohan Mehta", email: "rohan@example.com", phone: "+91 9800022222", date: inDays(2), time: "09:30", guests: 4, specialRequests: "", status: "pending" },
      { name: "Lena Kapoor", email: "lena@example.com", phone: "+91 9800033333", date: inDays(3), time: "17:00", guests: 6, specialRequests: "Window seating for photography.", status: "pending" },
    ],
  });

  // Sample order (for dashboard realism)
  const sampleItems = await db.product.findMany({ take: 3 });
  if (sampleItems.length >= 2) {
    const sub = sampleItems.slice(0, 2).reduce((s, p, i) => s + p.price * (i + 1), 0);
    const order = await db.order.create({
      data: {
        orderNumber: "BB-DEMO01-001",
        customerName: "Anaïs Verma",
        email: "anais@example.com",
        phone: "+91 9800011111",
        fulfillment: "delivery",
        address: "22 Lavelle Lane, Bengaluru 560001",
        instructions: "Leave at the front desk.",
        subtotal: sub,
        discount: 0,
        deliveryCharge: 40,
        total: sub + 40,
        status: "confirmed",
        paymentStatus: "paid",
        paymentMode: "upi",
      },
    });
    await db.orderItem.createMany({
      data: sampleItems.slice(0, 2).map((p, i) => ({
        orderId: order.id,
        productId: p.id,
        productName: p.name,
        price: p.price,
        quantity: i + 1,
      })),
    });
  }

  // Contact messages + newsletter
  await db.contactMessage.createMany({
    data: [
      { name: "Ishaan Rao", email: "ishaan@example.com", subject: "Private event enquiry", message: "We'd love to host a small book launch for ~20 guests next month. Could you share options?" },
      { name: "Maya Sen", email: "maya@example.com", subject: "Catering", message: "Do you offer corporate coffee catering for mornings?" },
    ],
  });
  await db.newsletterSubscriber.createMany({
    data: [
      { email: "anais@example.com" },
      { email: "rohan@example.com" },
      { email: "maya@example.com" },
    ],
  });

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
