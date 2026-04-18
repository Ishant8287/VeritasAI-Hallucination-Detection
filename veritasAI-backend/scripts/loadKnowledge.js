import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, "../.env") });

const ingestData = async (documents) => {
  if (!Array.isArray(documents) || documents.length === 0) {
    return;
  }

  try {
    const index = getIndex();

    const vectors = (
      await Promise.all(
        documents.map(async (doc, i) => {
          const embedding = await getEmbedding(doc);
          if (!embedding || embedding.length === 0) {
            console.warn(
              `⚠️  Skipping doc ${i} — embedding failed: "${doc.slice(0, 60)}..."`,
            );
            return null;
          }
          return {
            id: `doc-${i}-${Date.now()}`,
            values: embedding,
            metadata: {
              text: doc,
              source: "custom-dataset",
            },
          };
        }),
      )
    ).filter(Boolean);

    if (vectors.length === 0) {
      console.error("All embeddings failed — nothing to upsert");
      return;
    }

    // Pinecone recommends batches of 100
    const BATCH_SIZE = 100;
    for (let i = 0; i < vectors.length; i += BATCH_SIZE) {
      const batch = vectors.slice(i, i + BATCH_SIZE);
      await index.upsert(batch);
    }
  } catch (error) {
    console.error("Ingestion error:", error.message);
    process.exit(1);
  }
};

const documents = [
  // Science & Space
  "The Sun is primarily composed of hydrogen and helium.",
  "A day on Venus is longer than a year on Venus.",
  "Mars has two moons named Phobos and Deimos.",
  "Jupiter has the shortest day of all planets.",
  "Saturn has a lower density than water.",
  "Neptune was discovered in 1846.",
  "The asteroid belt lies between Mars and Jupiter.",
  "The Milky Way is a barred spiral galaxy.",
  "Light takes about 8 minutes to travel from the Sun to Earth.",
  "The Moon has no atmosphere.",

  // Physics
  "Sound requires a medium to travel.",
  "Light can travel through a vacuum.",
  "Heat flows from hotter objects to colder ones.",
  "Energy is conserved in a closed system.",
  "Friction converts kinetic energy into heat.",
  "The SI unit of force is the newton.",
  "The SI unit of energy is the joule.",
  "Velocity includes both speed and direction.",
  "Acceleration can be negative.",
  "Mass is a measure of inertia.",

  // Chemistry
  "Oxygen is essential for combustion.",
  "Hydrogen is the most abundant element in the universe.",
  "Carbon forms the basis of organic chemistry.",
  "Sodium chloride is common salt.",
  "Acids have a pH less than 7.",
  "Bases have a pH greater than 7.",
  "Neutral solutions have a pH of 7.",
  "Gold is chemically unreactive.",
  "Iron rusts in the presence of oxygen and moisture.",
  "Water is a universal solvent.",

  // Biology
  "Humans have five basic senses.",
  "The heart has four chambers.",
  "Blood is pumped by the heart through arteries and veins.",
  "The brain is protected by the skull.",
  "The spinal cord is part of the central nervous system.",
  "The digestive system breaks down food.",
  "The liver detoxifies chemicals.",
  "The kidneys regulate fluid balance.",
  "The skin protects the body from external damage.",
  "The immune system defends against pathogens.",

  // Geography
  "Asia is the largest continent by area.",
  "Africa is the second largest continent.",
  "Europe is smaller than Asia.",
  "North America is in the Northern Hemisphere.",
  "South America is mostly in the Southern Hemisphere.",
  "Australia is both a country and a continent.",
  "Antarctica has no permanent residents.",
  "The Pacific Ocean is larger than the Atlantic Ocean.",
  "The Indian Ocean is the third largest ocean.",
  "Mount Everest lies on the border of Nepal and China.",

  // History
  "The United Nations was established in 1945.",
  "World War I ended in 1918.",
  "World War II ended in 1945.",
  "The American Declaration of Independence was signed in 1776.",
  "The French Revolution began in 1789.",
  "The Roman Empire fell in 476 AD.",
  "The Cold War ended in 1991.",
  "The printing press was invented in the 15th century.",
  "The Industrial Revolution began in the 18th century.",
  "The Berlin Wall fell in 1989.",

  // Math
  "A triangle has three angles.",
  "A square has four right angles.",
  "The sum of angles in a quadrilateral is 360 degrees.",
  "A straight line measures 180 degrees.",
  "A right angle measures 90 degrees.",
  "Parallel lines never meet.",
  "Perpendicular lines intersect at 90 degrees.",
  "The area of a rectangle is length times width.",
  "The perimeter of a square is four times its side.",
  "A cube has six faces.",

  // Technology
  "Computers process data using binary numbers.",
  "Binary consists of 0s and 1s.",
  "An operating system manages hardware and software.",
  "Windows is an operating system.",
  "Linux is an open-source operating system.",
  "MacOS is developed by Apple.",
  "The internet connects computers worldwide.",
  "Wi-Fi allows wireless internet access.",
  "A browser is used to access websites.",
  "Search engines help find information online.",

  // Misc
  "Water covers about 71 percent of Earth's surface.",
  "Earth's atmosphere is composed mainly of nitrogen and oxygen.",
  "The ozone layer protects Earth from harmful UV radiation.",
  "Seasons are caused by Earth's axial tilt.",
  "The equinox occurs twice a year.",
  "The solstice occurs twice a year.",
  "A leap year has 366 days.",
  "A week has 7 days.",
  "A year has 12 months.",
  "There are 24 hours in a day.",

  // Science & Space
  "The Earth is approximately 4.54 billion years old.",
  "The Sun is about 4.6 billion years old.",
  "A year on Mercury is about 88 Earth days.",
  "Jupiter has a Great Red Spot which is a giant storm.",
  "Saturn has more than 80 known moons.",
  "Uranus is an ice giant planet.",
  "Neptune has strong supersonic winds.",
  "Pluto is classified as a dwarf planet.",
  "The Kuiper Belt lies beyond Neptune.",
  "The Oort Cloud is a theoretical cloud of icy objects.",

  // Physics
  "Speed is the rate of change of distance with time.",
  "Momentum is the product of mass and velocity.",
  "Work is done when a force moves an object.",
  "Power is the rate of doing work.",
  "Density is mass per unit volume.",
  "Pressure is force per unit area.",
  "Temperature measures the average kinetic energy of particles.",
  "Waves transfer energy without transferring matter.",
  "Reflection is the bouncing of light.",
  "Refraction is the bending of light.",

  // Chemistry
  "Atoms are made of protons, neutrons, and electrons.",
  "Protons carry a positive charge.",
  "Electrons carry a negative charge.",
  "Neutrons have no charge.",
  "The atomic number defines the element.",
  "The periodic table organizes elements.",
  "Helium is a noble gas.",
  "Nitrogen makes up most of Earth's atmosphere.",
  "Oxygen supports respiration.",
  "Carbon dioxide is exhaled by humans.",

  // Biology
  "Plants have cell walls made of cellulose.",
  "Animal cells do not have cell walls.",
  "Chlorophyll gives plants their green color.",
  "The circulatory system transports nutrients.",
  "The respiratory system enables breathing.",
  "The nervous system transmits signals.",
  "The endocrine system uses hormones.",
  "The skeletal system supports the body.",
  "Muscles enable movement.",
  "The eye detects light.",

  // Geography
  "The capital of China is Beijing.",
  "The capital of Russia is Moscow.",
  "The capital of Brazil is Brasilia.",
  "The capital of South Korea is Seoul.",
  "The capital of Egypt is Cairo.",
  "The capital of Argentina is Buenos Aires.",
  "The capital of Turkey is Ankara.",
  "The capital of Indonesia is Jakarta.",
  "The capital of Saudi Arabia is Riyadh.",
  "The capital of Mexico is Mexico City.",

  // History
  "The Titanic sank in 1912.",
  "The League of Nations was formed after World War I.",
  "The United States entered World War II in 1941.",
  "The Soviet Union dissolved in 1991.",
  "India became a republic in 1950.",
  "The first Olympic Games were held in ancient Greece.",
  "The Renaissance was a cultural movement in Europe.",
  "The Industrial Revolution increased production.",
  "The Cold War involved political tension.",
  "The Magna Carta limited the power of the king.",

  // Math
  "A pentagon has five sides.",
  "A hexagon has six sides.",
  "A heptagon has seven sides.",
  "An octagon has eight sides.",
  "A nonagon has nine sides.",
  "A decagon has ten sides.",
  "A cube has 12 edges.",
  "A sphere has no edges.",
  "A cylinder has two circular faces.",
  "A cone has one base.",

  // Technology
  "A CPU executes instructions.",
  "RAM is used for temporary storage.",
  "Hard drives store data permanently.",
  "Solid-state drives have no moving parts.",
  "A motherboard connects components.",
  "Input devices send data to computers.",
  "Output devices display results.",
  "Keyboards are input devices.",
  "Monitors are output devices.",
  "Printers produce physical copies.",

  // Environment
  "Global warming refers to rising average temperatures.",
  "Greenhouse gases trap heat in the atmosphere.",
  "Carbon dioxide is a greenhouse gas.",
  "Methane is a potent greenhouse gas.",
  "Renewable energy includes solar power.",
  "Wind energy is renewable.",
  "Hydropower uses flowing water.",
  "Deforestation reduces biodiversity.",
  "Recycling helps conserve resources.",
  "Pollution harms ecosystems.",

  // Misc
  "A calendar year has 365 days.",
  "A decade is 10 years.",
  "A century is 100 years.",
  "A millennium is 1000 years.",
  "There are 60 seconds in a minute.",
  "There are 60 minutes in an hour.",
  "There are 12 inches in a foot.",
  "There are 3 feet in a yard.",
  "There are 100 centimeters in a meter.",
  "There are 1000 meters in a kilometer.",

  // Science & Space
  "The Sun generates energy through nuclear fusion.",
  "The core of the Earth is primarily composed of iron and nickel.",
  "Earth's crust is the outermost layer of the planet.",
  "The mantle lies between the crust and the core.",
  "The Earth's magnetic field protects against solar radiation.",
  "The Moon's gravity causes ocean tides on Earth.",
  "A solar system consists of a star and objects orbiting it.",
  "Galaxies contain stars, gas, and dust.",
  "Black holes have gravitational fields so strong that light cannot escape.",
  "The observable universe is about 93 billion light-years in diameter.",

  // Physics
  "Inertia is the resistance of an object to changes in motion.",
  "Newton's first law is also called the law of inertia.",
  "Action and reaction forces are equal and opposite.",
  "Kinetic energy depends on mass and velocity.",
  "Potential energy depends on position.",
  "Heat is a form of energy transfer.",
  "Thermal expansion occurs when substances are heated.",
  "Conductors allow heat to pass through them.",
  "Insulators resist heat transfer.",
  "Light behaves as both a particle and a wave.",

  // Chemistry
  "An element is a pure substance made of one type of atom.",
  "A compound is made of two or more elements chemically combined.",
  "Mixtures can be separated by physical means.",
  "Chemical reactions involve rearrangement of atoms.",
  "The law of conservation of mass applies to chemical reactions.",
  "pH measures acidity or alkalinity.",
  "Distilled water is neutral.",
  "Salts are formed from acid-base reactions.",
  "The periodic table is arranged by atomic number.",
  "Metals are good conductors of heat and electricity.",

  // Biology
  "The human body has billions of cells.",
  "Red blood cells contain hemoglobin.",
  "White blood cells help fight infections.",
  "Platelets help in blood clotting.",
  "The stomach helps digest food.",
  "The small intestine absorbs nutrients.",
  "The large intestine absorbs water.",
  "The brain has different regions with specific functions.",
  "Neurons transmit electrical signals.",
  "Reflex actions are quick responses to stimuli.",

  // Geography
  "The Andes is the longest mountain range in the world.",
  "The Rocky Mountains are in North America.",
  "The Alps are located in Europe.",
  "The Ganges River flows through India and Bangladesh.",
  "The Yangtze River is the longest river in Asia.",
  "The Mississippi River is a major river in the USA.",
  "The Mediterranean Sea lies between Europe and Africa.",
  "The Atlantic Ocean separates Europe and the Americas.",
  "The Pacific Ocean separates Asia and the Americas.",
  "The Indian Ocean lies between Africa, Asia, and Australia.",

  // History
  "Ancient Egypt developed along the Nile River.",
  "The pyramids were built as tombs for pharaohs.",
  "The Roman Republic preceded the Roman Empire.",
  "Julius Caesar was a Roman leader.",
  "The Byzantine Empire was centered in Constantinople.",
  "The Ottoman Empire lasted for several centuries.",
  "The American Civil War was fought from 1861 to 1865.",
  "Slavery was abolished in the United States in 1865.",
  "The First World War involved many European nations.",
  "The Second World War was a global conflict.",

  // Math
  "A line segment has two endpoints.",
  "A ray has one endpoint and extends infinitely.",
  "A polygon is a closed figure with straight sides.",
  "A regular polygon has equal sides and angles.",
  "The area of a triangle is half base times height.",
  "The circumference of a circle depends on its radius.",
  "A cube has equal edges.",
  "A sphere is a three-dimensional object.",
  "A prism has two parallel bases.",
  "A pyramid has a single base and triangular faces.",

  // Technology
  "Software consists of programs and data.",
  "Hardware refers to physical components of a computer.",
  "An operating system manages system resources.",
  "A file system organizes data on storage devices.",
  "A network connects multiple computers.",
  "The internet is a global network.",
  "Email is used for digital communication.",
  "Databases store structured information.",
  "Programming languages are used to write software.",
  "Algorithms are step-by-step procedures.",

  // Environment
  "Biodiversity refers to the variety of life.",
  "Ecosystems consist of living and non-living components.",
  "Photosynthesis supports life on Earth.",
  "Food chains show energy flow.",
  "Producers make their own food.",
  "Consumers rely on other organisms for food.",
  "Decomposers break down dead matter.",
  "Climate refers to long-term weather patterns.",
  "Weather refers to short-term atmospheric conditions.",
  "Natural resources include water and minerals.",

  // Misc
  "There are 7 continents on Earth.",
  "There are 5 oceans on Earth.",
  "A leap year occurs every 4 years with exceptions.",
  "The Gregorian calendar is widely used today.",
  "There are 360 degrees in a circle.",
  "A right triangle has one 90-degree angle.",
  "An acute angle is less than 90 degrees.",
  "An obtuse angle is greater than 90 degrees.",
  "Parallel lines remain equidistant.",
  "Perpendicular lines intersect at right angles.",
];

ingestData(documents);
