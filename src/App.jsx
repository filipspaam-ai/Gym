import { useState } from "react";

const DAYS = {
  push: {
    name: "PUSH Day",
    emoji: "💪",
    focus: "Chest, Shoulders, Triceps",
    warmup: [
      { name: "Arm circles", detail: "20 forward + 20 backward" },
      { name: "Band pull-aparts", detail: "15 reps" },
      { name: "Push-up to downward dog", detail: "8 reps" },
      { name: "Empty bar bench press", detail: "10 reps (warm up the pattern)" },
    ],
    exercises: [
      {
        name: "Flat Bench Press (Barbell)",
        sets: "4×6-10",
        rest: "2-3 min",
        startKg: "40kg",
        progression: "Add 2.5kg when you hit 4×10. Aim for 60kg within 3 months.",
        note: "Since you like bench — this is your primary horizontal push. Full range of motion: bar touches chest, press to full lockout. Retract shoulder blades, slight arch, feet flat.",
        swap: "Dumbbell bench press (20kg each to start)",
        flexTip: "Always do full ROM — partial reps shorten the pec and kill shoulder mobility.",
      },
      {
        name: "Weighted Dips",
        sets: "3×6-10",
        rest: "2-3 min",
        startKg: "BW +5kg",
        progression: "Add 2.5kg when you hit 3×10. Target: BW +20kg within 4 months.",
        note: "Lean slightly forward for chest focus, stay upright for tricep focus. Go deep — full stretch at the bottom.",
        swap: "Bodyweight dips 3×max if no belt",
        flexTip: "Deep dips actually improve shoulder flexibility when done with full ROM.",
      },
      {
        name: "Standing Overhead Press (Barbell)",
        sets: "3×6-10",
        rest: "2 min",
        startKg: "30kg",
        progression: "Add 2.5kg when you hit 3×10. This lift progresses slowly — 40kg strict is solid.",
        note: "Standing, strict, no leg drive. Engages core and stabilizers. Press bar overhead and slightly behind head at lockout.",
        swap: "Dumbbell OHP (14kg each) or pike push-ups",
        flexTip: "Overhead pressing through full range actually builds shoulder flexibility.",
      },
      {
        name: "Cable Chest Fly (Machine ✓)",
        sets: "3×12-15",
        rest: "60 sec",
        startKg: "7-10kg each side",
        progression: "Add 2.5kg when reps feel easy. Isolation — keep it lighter.",
        note: "Cables provide constant tension through the whole arc. Squeeze at center, control the stretch. Way better than a pec deck.",
        swap: "Ring flyes or wide push-ups",
        flexTip: "Let the stretch go DEEP — arms wide open. Builds chest flexibility while training.",
      },
      {
        name: "Lateral Raises (Dumbbell)",
        sets: "3×12-15",
        rest: "60 sec",
        startKg: "6kg each",
        progression: "Add 1-2kg when form stays clean at 15 reps.",
        note: "Slight lean forward, lead with elbows, control the negative. Builds shoulder width.",
        swap: "Cable lateral raises (single arm)",
        flexTip: "Light weight + full ROM = shoulder health. Never ego lift these.",
      },
      {
        name: "Overhead Tricep Extension (Cable, Machine ✓)",
        sets: "2×12-15",
        rest: "60 sec",
        startKg: "15-20kg rope",
        progression: "Add 2.5-5kg when you hit 2×15 comfortably.",
        note: "Rope attachment, face away from stack. Deep stretch at bottom — long head of tricep needs this.",
        swap: "Dumbbell overhead extension (10kg)",
        flexTip: "The deep stretch position here is actively good for tricep/shoulder flexibility.",
      },
    ],
    stretching: "push",
    duration: "~55 min + 10 min stretch",
  },
  pull: {
    name: "PULL Day",
    emoji: "🏋️",
    focus: "Back, Biceps, Rear Delts",
    warmup: [
      { name: "Cat-cow stretches", detail: "10 reps" },
      { name: "Scapular pull-ups", detail: "10 reps" },
      { name: "Band rows", detail: "15 reps" },
      { name: "Dead hang", detail: "30 sec" },
    ],
    exercises: [
      {
        name: "Weighted Pull-Ups",
        sets: "4×5-8",
        rest: "2-3 min",
        startKg: "BW +5kg",
        progression: "Add 2.5kg when you hit 4×8. Target: BW +15-20kg in 4-5 months.",
        note: "Full dead hang at bottom, chin over bar at top. THE best back exercise. You already have the skill — now load it.",
        swap: "Strict bodyweight pull-ups with 4-sec negatives",
        flexTip: "Dead hang at the bottom is a full lat stretch. Don't cut it short.",
      },
      {
        name: "Barbell Row",
        sets: "3×8-12",
        rest: "90 sec",
        startKg: "40kg",
        progression: "Add 2.5-5kg when you hit 3×12. Target: 60kg clean form.",
        note: "Hinge at hips, back flat, pull to lower chest. Control the negative. Builds thick back that pull-ups alone can't.",
        swap: "Dumbbell rows (18kg each, one arm)",
        flexTip: "Let bar hang at full arm extension — stretches lats and rhomboids.",
      },
      {
        name: "Face Pulls (Cable, Machine ✓)",
        sets: "3×15-20",
        rest: "60 sec",
        startKg: "10-15kg rope",
        progression: "Add 2.5kg when you hit 3×20. Keep it light — this is for health.",
        note: "THE most important exercise for shoulder health and posture. External rotation at top, squeeze shoulder blades.",
        swap: "Band pull-aparts (high reps)",
        flexTip: "Directly combats the internal rotation that makes gym guys stiff. Non-negotiable.",
      },
      {
        name: "Lat Pulldown (Machine ✓)",
        sets: "3×10-12",
        rest: "60 sec",
        startKg: "40-45kg",
        progression: "Add 5kg when you hit 3×12.",
        note: "Wide grip, pull to upper chest, slight lean back. Good machine — mimics natural pull and gives extra volume after pull-ups are spent.",
        swap: "Banded pulldowns or more chin-up sets",
        flexTip: "Full stretch at top — let arms go fully overhead between reps.",
      },
      {
        name: "Chin-Ups (Supinated Grip)",
        sets: "3×8-12",
        rest: "90 sec",
        startKg: "Bodyweight",
        progression: "Add weight when you hit 3×12.",
        note: "Palms facing you — more bicep, still great for lats. Different angle than pull-ups.",
        swap: "Neutral grip pull-ups",
        flexTip: "Full hang stretch at bottom — same decompression benefit.",
      },
      {
        name: "Dumbbell Hammer Curls",
        sets: "2×10-12",
        rest: "60 sec",
        startKg: "10kg each",
        progression: "Add 2kg when you hit 2×12.",
        note: "Neutral grip. Builds functional arm strength for grip, basketball, hanging.",
        swap: "Towel pull-up hangs for grip",
        flexTip: "Full extension at bottom — don't keep elbows permanently bent.",
      },
    ],
    stretching: "pull",
    duration: "~50 min + 10 min stretch",
  },
  legs: {
    name: "LEGS & CORE Day",
    emoji: "🦵",
    focus: "Quads, Hamstrings, Glutes, Core",
    warmup: [
      { name: "Bodyweight squats", detail: "15 reps" },
      { name: "Walking lunges", detail: "10 each leg" },
      { name: "Hip circles", detail: "10 each direction" },
      { name: "Leg swings (front + side)", detail: "10 each leg, each direction" },
    ],
    exercises: [
      {
        name: "Barbell Back Squat",
        sets: "4×6-10",
        rest: "2-3 min",
        startKg: "40kg",
        progression: "Add 2.5-5kg/week when you hit 4×10. Target: 70-80kg in 3-4 months.",
        note: "Go below parallel — full depth squats protect knees and build basketball explosiveness. Bar on upper traps.",
        swap: "Goblet squat (20kg dumbbell) while learning form",
        flexTip: "Deep squats BUILD hip and ankle flexibility. ATG if mobility allows.",
      },
      {
        name: "Romanian Deadlift (Barbell)",
        sets: "3×8-12",
        rest: "90 sec",
        startKg: "40kg",
        progression: "Add 2.5-5kg when you hit 3×12. Target: 60-70kg perfect form.",
        note: "Soft knees, hinge at hips, feel the hamstring stretch. Bar stays close to legs. #1 exercise for sprint speed + basketball injury prevention.",
        swap: "Single-leg RDL (12kg dumbbell each)",
        flexTip: "This IS a hamstring stretch under load. The exercise itself improves flexibility.",
      },
      {
        name: "Bulgarian Split Squats (Dumbbell)",
        sets: "3×8-10 each leg",
        rest: "90 sec",
        startKg: "10kg each hand",
        progression: "Add 2kg each hand when you hit 3×10.",
        note: "Rear foot on bench. Unilateral = fixes imbalances, builds single-leg power for cuts and jumps.",
        swap: "Walking lunges (12kg each hand)",
        flexTip: "Rear leg gets a deep hip flexor stretch every rep. Go slow and feel it.",
      },
      {
        name: "Leg Curl (Machine ✓)",
        sets: "3×10-12",
        rest: "60 sec",
        startKg: "25-30kg",
        progression: "Add 5kg when you hit 3×12.",
        note: "Isolates hamstrings in a way free weights can't. Slow negative (3 sec down). Hamstring strength prevents ACL injuries — critical for basketball.",
        swap: "Nordic curls (bodyweight, assisted)",
        flexTip: "Full extension at top — let hamstring stretch fully before curling.",
      },
      {
        name: "Standing Calf Raises",
        sets: "4×12-15",
        rest: "60 sec",
        startKg: "BW or hold 14-16kg DB",
        progression: "Calves need volume > weight. Add 5kg when 4×15 is easy.",
        note: "Stand on step edge. Full stretch bottom, full squeeze top. 2-sec hold at top.",
        swap: "Single-leg calf raises on a step (BW)",
        flexTip: "Deep heel drop IS a calf stretch. Prevents Achilles issues.",
      },
      {
        name: "Hanging Leg Raises",
        sets: "3×10-15",
        rest: "60 sec",
        startKg: "Bodyweight",
        progression: "Knees→straight legs→toes to bar. Ankle weights when toes-to-bar is easy.",
        note: "Core + hip flexors + spinal decompression. The hang itself is growth protocol.",
        swap: "L-sit holds on parallel bars",
        flexTip: "Full straight body hang between sets = decompression.",
      },
      {
        name: "Ab Wheel Rollouts",
        sets: "3×8-12",
        rest: "60 sec",
        startKg: "BW (knees→standing)",
        progression: "3×12 from knees → start from toes.",
        note: "Anti-extension core strength — protects spine in every lift and sport.",
        swap: "Dead bugs (3×10 each side)",
        flexTip: "Full extension stretches abs and lats.",
      },
    ],
    stretching: "legs",
    duration: "~60 min + 12 min stretch",
  },
};

const STRETCHING = {
  push: {
    name: "Post-Push Stretch",
    time: "10 min",
    exercises: [
      { name: "Dead Hang", dur: "3×30-45s", detail: "Spinal decompression + lat/shoulder stretch. Relax completely. GROWTH PROTOCOL.", tag: "growth" },
      { name: "Doorway Chest Stretch", dur: "45s each side", detail: "Forearm against frame at 90°. Step through for deep pec stretch. Prevents hunched chest posture.", tag: "flex" },
      { name: "Cross-Body Shoulder Stretch", dur: "30s each arm", detail: "Pull arm across chest. Posterior delt + rotator cuff.", tag: "flex" },
      { name: "Overhead Tricep/Lat Stretch", dur: "30s each arm", detail: "Reach behind head, other hand pulls elbow. Tricep long head + lat.", tag: "flex" },
      { name: "Behind-the-Back Clasp", dur: "30s each side", detail: "One arm over shoulder, one behind back, try to clasp. Tests shoulder rotation — if you can't clasp, you're getting stiff.", tag: "mobility" },
      { name: "Puppy Pose", dur: "45s", detail: "Knees on ground, walk hands forward, chest drops to floor. Deep thoracic extension + shoulder stretch.", tag: "flex" },
      { name: "Wrist Stretch", dur: "20s each direction", detail: "Arms out, pull fingers back then forward. Important after pressing and gripping.", tag: "health" },
    ],
  },
  pull: {
    name: "Post-Pull Stretch",
    time: "10 min",
    exercises: [
      { name: "Dead Hang (Extended)", dur: "3×45-60s", detail: "Go longer on pull days. Best lat stretch that exists. GROWTH PROTOCOL.", tag: "growth" },
      { name: "Seated Forward Fold", dur: "60s", detail: "Legs straight, fold from hips. Hamstrings + posterior chain. Hinge at hips, don't round upper back.", tag: "flex" },
      { name: "Cat-Cow Sequence", dur: "10 reps slow", detail: "All fours — arch then round. Mobilizes every vertebra. SLOW, articulate each segment.", tag: "mobility" },
      { name: "Thoracic Spine Rotation", dur: "8 each side", detail: "All fours, hand behind head, rotate to open chest to ceiling. Thoracic mobility = better posture = taller.", tag: "growth" },
      { name: "Foam Roller Thoracic Extension", dur: "1 min", detail: "Roller across upper back, hands behind head, extend over it. GROWTH PROTOCOL.", tag: "growth" },
      { name: "Lat Stretch on Bar", dur: "30s each side", detail: "Grab bar one hand, lean away, rotate hips. Deep unilateral lat stretch.", tag: "flex" },
      { name: "Bicep Wall Stretch", dur: "30s each arm", detail: "Palm on wall fingers pointing back, turn body away. Bicep + anterior shoulder.", tag: "flex" },
    ],
  },
  legs: {
    name: "Post-Legs Stretch",
    time: "12 min",
    exercises: [
      { name: "Deep Squat Hold (Malasana)", dur: "2 min total", detail: "Deep squat, elbows push knees out, spine tall. BEST hip mobility exercise. Do daily if possible.", tag: "mobility" },
      { name: "Couch Stretch (Hip Flexor)", dur: "60s each side", detail: "Rear knee against wall, front foot in lunge. DEEP hip flexor stretch. Tight hip flexors steal height and wreck posture. GROWTH PROTOCOL.", tag: "growth" },
      { name: "Standing Hamstring Stretch", dur: "45s each leg", detail: "Foot on bench, straight leg, hinge forward from hips.", tag: "flex" },
      { name: "Pigeon Pose", dur: "60s each side", detail: "Front shin across body, rear leg back. Deep glute + hip external rotation. Essential for basketball.", tag: "flex" },
      { name: "90/90 Hip Switch", dur: "8 each side", detail: "Both legs at 90°, rotate to switch. Builds internal + external rotation — improves cutting and pivoting.", tag: "mobility" },
      { name: "Standing Quad Stretch", dur: "30s each leg", detail: "Pull heel to glute, push hips forward. Keep knees together.", tag: "flex" },
      { name: "Calf Stretch (Wall)", dur: "30s each leg", detail: "Hands on wall, leg back, heel down. Straight leg = gastrocnemius, bent = soleus.", tag: "flex" },
      { name: "Dead Hang (Finish)", dur: "2×45s", detail: "Always finish with spinal decompression. GROWTH PROTOCOL.", tag: "growth" },
    ],
  },
};

const CREATINE = [
  { q: "When to take it?", a: "Doesn't matter — morning, evening, pre or post workout. Creatine works by saturation, not timing. Just take it the same time every day so you don't forget." },
  { q: "How much?", a: "5g per day. Every single day — training AND rest days. No loading phase needed. Just 5g daily, forever." },
  { q: "What type?", a: "Creatine monohydrate. The cheapest kind. Not HCL, not buffered, not fancy. 25+ years of research. Everything else is marketing." },
  { q: "How to take it?", a: "Mix in water, juice, shake, whatever. Dissolves poorly in cold water — use warm water or just stir and drink. Some put it in morning coffee or post-workout shake." },
  { q: "Water weight?", a: "Yes, 1-2kg water in first 2-3 weeks. This is inside your muscles (makes them look fuller), not bloat. Your 73kg target should account for this." },
  { q: "Cycle off?", a: "No. Most studied supplement in history. Safe long-term. 5g every day, done." },
];

const FLEX_OPTIONS = [
  { name: "Option A: Extra Upper Session", detail: "Did PUSH Monday? Do light PULL. Did PULL Tuesday? Do light PUSH. Drop weights 20%, focus on mind-muscle connection and full ROM. Extra upper frequency = faster gains toward 73kg.", color: "#60a5fa" },
  { name: "Option B: Cardio + Mobility (Best for Growth)", detail: "20-30 min light jog (zone 2) + FULL legs stretching routine + dead hangs. Trains cardio without taxing muscles. Extended stretching directly supports flexibility and height goals.", color: "#4ade80" },
  { name: "Option C: Park Calisthenics", detail: "Hit the bars — dips, pull-ups, muscle-ups, push-up variations. No structure, just move and enjoy. Weighted backpack for overload. 15 min stretching + dead hangs after.", color: "#a78bfa" },
  { name: "Option D: Full Rest", detail: "If it's been a heavy week or you feel beat up — rest. Dead hangs + light stretching at home. Recovery IS training.", color: "#6b7280" },
];

const FLEX_RULES = [
  { s: "You go play basketball", r: "That's your cardio. After: 10 min stretching (legs routine — pigeon, hip flexors, hamstrings) + dead hangs. Never stack legs + basketball." },
  { s: "You go for a run", r: "Light jog = can still train upper body (lift first, run after, 2+ hr gap). Sprint session = treat as leg workout, just stretch after." },
  { s: "No basketball, no run", r: "Pick from the flex day options below." },
  { s: "Feeling tired or sore", r: "Dead hangs + full stretching only. 1 full rest day/week minimum." },
  { s: "Can't get to gym at all", r: "Park: dips, pull-ups, push-ups, hanging leg raises + weighted backpack. 15 min stretching after." },
];

const GROWTH = [
  { title: "Dead Hangs (DAILY)", detail: "After EVERY session + before bed. 3-4×30-60s. Decompresses spine, recovers 1-2cm gravity steals daily." },
  { title: "Thoracic Mobility (DAILY)", detail: "Foam roller extensions, cat-cow, thread the needle. 5 min. Better posture = full height expressed." },
  { title: "Hamstring & Hip Flexor Stretching", detail: "Tight hamstrings/hip flexors tilt your pelvis and compress spine. Both steal height. Stretch daily." },
  { title: "Sleep on Your Back", detail: "Full spinal decompression overnight. Thin pillow under knees, supportive head pillow." },
  { title: "Nutrition for Growth Plates", detail: "At 19 you may still have open plates. Vitamin D, calcium (dairy), zinc, and protein support remaining growth." },
  { title: "Deep Squat Hold Daily", detail: "2 min total through the day. While watching TV, waiting for food. Opens hips, decompresses lower spine." },
];

const NUTRITION = {
  targets: { cal: "2800-3000", pro: "140-160g", carb: "350-400g", fat: "70-85g" },
  meals: [
    { name: "🌅 Breakfast", opts: [
      { m: "Oatmeal Power Bowl", d: "80g oats + banana + 30g PB + whey + honey. ~650 kcal, 35g protein." },
      { m: "Eggs & Toast", d: "4 eggs scrambled + 2 toast + avocado + tomato. ~600 kcal, 30g protein." },
      { m: "Kajgana + Bread", d: "Scrambled eggs with feta + wholegrain bread + yogurt. ~550 kcal, 30g protein." },
    ]},
    { name: "🍗 Lunch", opts: [
      { m: "Chicken Rice Bowl", d: "200g chicken + 150g rice + roasted veggies + olive oil. ~750 kcal, 50g protein." },
      { m: "Ćevapi Gains Plate", d: "5-6 ćevapi + lepinja + ajvar + salad + yogurt. ~800 kcal, 45g protein." },
      { m: "Tuna Pasta", d: "120g pasta + 2 cans tuna + olive oil + garlic + tomatoes. ~700 kcal, 50g protein." },
    ]},
    { name: "⚡ Snack", opts: [
      { m: "Shake", d: "Whey + banana + milk + 20g oats. ~400 kcal, 35g protein." },
      { m: "PB Honey Toast", d: "2 slices bread + PB + honey. ~350 kcal." },
      { m: "Greek Yogurt Bowl", d: "200g Greek yogurt + granola + berries. ~300 kcal, 25g protein." },
    ]},
    { name: "🥩 Dinner", opts: [
      { m: "Steak & Potatoes", d: "200g beef + 300g potatoes + grilled veggies. ~700 kcal, 45g protein." },
      { m: "Đuveč + Chicken", d: "Rice/pepper/tomato stew + grilled chicken. ~650 kcal, 40g protein." },
      { m: "Salmon + Sweet Potato", d: "200g salmon + sweet potato + spinach. ~600 kcal, 40g protein." },
    ]},
    { name: "🌙 Before Bed", opts: [
      { m: "Cottage Cheese + Honey", d: "200g cottage cheese + walnuts. Casein = slow overnight. ~300 kcal, 25g protein." },
      { m: "Milk + PB Toast", d: "Whole milk + PB toast. ~350 kcal, 18g protein." },
    ]},
  ],
  rules: [
    "Eat within 1-2 hours after training",
    "30-50g protein per meal, distributed across the day",
    "Don't fear carbs — fuel for basketball, running, growth",
    "3+ liters water daily, more on active days",
    "Creatine: 5g daily (see Creatine tab)",
    "Sleep 8+ hours — growth hormone peaks during deep sleep",
    "Scale not moving after 2 weeks → add a snack or bigger portions",
    "Red meat 2-3x/week for iron, zinc, natural creatine",
  ],
};

function App() {
  const [tab, setTab] = useState("schedule");
  const [open, setOpen] = useState({});
  const toggle = (key) => setOpen(p => ({ ...p, [key]: !p[key] }));

  const tabs = [
    { id: "schedule", label: "Schedule" },
    { id: "workouts", label: "Workouts" },
    { id: "stretching", label: "Stretching" },
    { id: "nutrition", label: "Nutrition" },
    { id: "creatine", label: "Creatine" },
    { id: "flex", label: "Flex Day" },
    { id: "growth", label: "Growth" },
  ];

  const SCHEDULE = [
    { day: "Mon", label: "PUSH DAY", c: "#4ade80", badge: "GYM" },
    { day: "Tue", label: "PULL DAY", c: "#60a5fa", badge: "GYM" },
    { day: "Wed", label: "FLEX — Basketball / Run / Option", c: "#fb923c", badge: "FLEX" },
    { day: "Thu", label: "LEGS & CORE", c: "#a78bfa", badge: "GYM" },
    { day: "Fri", label: "PUSH DAY (variation)", c: "#4ade80", badge: "GYM" },
    { day: "Sat", label: "FLEX — Basketball / Run / Option", c: "#fb923c", badge: "FLEX" },
    { day: "Sun", label: "FULL REST + Mobility Only", c: "#6b7280", badge: "REST" },
  ];

  const tagColors = { growth: "#4ade80", flex: "#60a5fa", mobility: "#a78bfa", health: "#fb923c" };

  return (
    <div style={{ fontFamily: "'IBM Plex Mono', 'SF Mono', monospace", background: "var(--bg)", color: "var(--t)", minHeight: "100vh" }}>
      <style>{`
        :root { --bg:#09090b;--c:#131316;--bd:#1e1e24;--acc:#4ade80;--acc2:#22c55e;--ad:#14532d;--ag:rgba(74,222,128,0.07);--t:#e4e4e7;--td:#71717a;--tm:#a1a1aa;--or:#fb923c;--bl:#60a5fa;--pu:#a78bfa; }
        @media(prefers-color-scheme:light){:root{--bg:#f8f8f6;--c:#fff;--bd:#e4e4e0;--acc:#16a34a;--acc2:#15803d;--ad:#bbf7d0;--ag:rgba(22,163,74,0.05);--t:#18181b;--td:#71717a;--tm:#52525b;--or:#ea580c;--bl:#2563eb;--pu:#7c3aed;}}
        *{box-sizing:border-box;margin:0;padding:0;}
        .tabs{display:flex;gap:1px;padding:10px 12px;overflow-x:auto;border-bottom:1px solid var(--bd);position:sticky;top:0;background:var(--bg);z-index:10;-webkit-overflow-scrolling:touch;}
        .tb{padding:7px 10px;border:1px solid var(--bd);background:var(--c);color:var(--td);font-family:inherit;font-size:10px;cursor:pointer;white-space:nowrap;text-transform:uppercase;letter-spacing:.5px;transition:all .15s;}
        .tb:first-child{border-radius:5px 0 0 5px}.tb:last-child{border-radius:0 5px 5px 0}
        .tb.on{background:var(--acc);color:#000;border-color:var(--acc);font-weight:800}
        .s{padding:16px 14px;max-width:700px;margin:0 auto}
        .cd{background:var(--c);border:1px solid var(--bd);border-radius:7px;padding:14px;margin-bottom:8px}
        .ch{display:flex;justify-content:space-between;align-items:center;cursor:pointer;user-select:none}
        .ct{font-size:13px;font-weight:700;color:var(--acc);letter-spacing:.3px}
        .cs{font-size:10px;color:var(--td);margin-top:2px}
        .cv{transition:transform .2s;color:var(--td);font-size:11px}.cv.o{transform:rotate(90deg)}
        .sl{font-size:9px;text-transform:uppercase;letter-spacing:1px;color:var(--td);margin:14px 0 6px;font-weight:700}
      `}</style>

      <div style={{ padding: "20px 14px 12px", maxWidth: 700, margin: "0 auto" }}>
        <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: -0.5 }}>YOUR TRAINING SYSTEM v2</div>
        <div style={{ fontSize: 11, color: "var(--td)", marginTop: 4, lineHeight: 1.6 }}>
          Push/Pull/Legs · Compound + Calisthenics · Full Flexibility Protocol · Starting weights · Creatine guide
        </div>
        <div style={{ display: "flex", gap: 16, marginTop: 10, fontSize: 11 }}>
          <span>Now: <strong style={{ color: "var(--acc)" }}>67kg · 178cm</strong></span>
          <span>Goal: <strong style={{ color: "var(--acc)" }}>73kg lean · 180cm</strong></span>
        </div>
      </div>

      <div className="tabs">
        {tabs.map(t => <button key={t.id} className={`tb ${tab===t.id?"on":""}`} onClick={()=>setTab(t.id)}>{t.label}</button>)}
      </div>

      {tab==="schedule"&&<div className="s">
        <div className="cd">
          <div className="ct" style={{marginBottom:10}}>WEEKLY SCHEDULE</div>
          {SCHEDULE.map((d,i)=><div key={i} style={{display:"flex",alignItems:"center",padding:"9px 10px",borderBottom:i<6?"1px solid var(--bd)":"none",gap:12}}>
            <div style={{width:30,fontSize:10,color:"var(--td)",fontWeight:700,flexShrink:0}}>{d.day}</div>
            <div style={{flex:1,fontSize:12,fontWeight:700,color:d.c}}>{d.label}</div>
            <span style={{fontSize:9,padding:"2px 7px",borderRadius:3,fontWeight:700,background:d.badge==="REST"?"var(--bd)":d.badge==="FLEX"?"rgba(251,146,60,0.12)":"var(--ag)",color:d.badge==="REST"?"var(--td)":d.badge==="FLEX"?"var(--or)":"var(--acc)",textTransform:"uppercase"}}>{d.badge}</span>
          </div>)}
        </div>
        <div className="cd" style={{marginTop:8}}>
          <div className="ct" style={{marginBottom:6}}>WHY THIS SPLIT</div>
          <div style={{fontSize:11,color:"var(--tm)",lineHeight:1.7}}>
            <strong>Push/Pull/Legs</strong> groups muscles that work together. Push 2x/week (Mon+Fri) for growth, pull Tuesday, legs Thursday. Wed and Sat are <strong style={{color:"var(--or)"}}>FLEX DAYS</strong> — basketball is random for you, so these adapt. If you play, great. If not, check the Flex Day tab. Sunday is non-negotiable rest.
          </div>
        </div>
      </div>}

      {tab==="workouts"&&<div className="s">
        {Object.entries(DAYS).map(([k,day])=><div className="cd" key={k}>
          <div className="ch" onClick={()=>toggle("w_"+k)}>
            <div><div className="ct">{day.emoji} {day.name}</div><div className="cs">{day.focus} — {day.duration}</div></div>
            <span className={`cv ${open["w_"+k]?"o":""}`}>▶</span>
          </div>
          {open["w_"+k]&&<div style={{marginTop:10}}>
            <div className="sl">Warm-Up (5 min)</div>
            {day.warmup.map((w,i)=><div key={i} style={{fontSize:11,color:"var(--tm)",padding:"3px 0"}}>→ {w.name} — {w.detail}</div>)}
            <div className="sl" style={{marginTop:14}}>Exercises</div>
            {day.exercises.map((ex,i)=><div key={i} style={{padding:"12px 0",borderBottom:i<day.exercises.length-1?"1px solid var(--bd)":"none"}}>
              <div style={{fontWeight:700,fontSize:13,color:"var(--t)"}}>{i+1}. {ex.name}</div>
              <div style={{display:"flex",gap:12,marginTop:5,fontSize:11,color:"var(--tm)",flexWrap:"wrap"}}>
                <span>📐 {ex.sets}</span><span>⏱ {ex.rest}</span>
                <span style={{color:"var(--acc)",fontWeight:700}}>🏋️ {ex.startKg}</span>
              </div>
              <div style={{fontSize:11,color:"var(--acc2)",marginTop:5,fontWeight:600}}>📈 {ex.progression}</div>
              <div style={{fontSize:11,color:"var(--td)",marginTop:5,lineHeight:1.6}}>{ex.note}</div>
              <div style={{fontSize:10,color:"var(--or)",marginTop:4,fontStyle:"italic"}}>↔ {ex.swap}</div>
              <div style={{fontSize:10,color:"var(--bl)",marginTop:3}}>🧘 {ex.flexTip}</div>
            </div>)}
          </div>}
        </div>)}
      </div>}

      {tab==="stretching"&&<div className="s">
        <div style={{fontSize:11,color:"var(--tm)",marginBottom:14,lineHeight:1.7}}>
          <strong style={{color:"var(--acc)"}}>Do these AFTER every session. Non-negotiable.</strong> Every exercise in your program works through full ROM, and this stretching ensures you GAIN flexibility as you get stronger. Items tagged <span style={{color:"#4ade80",fontWeight:700}}>GROWTH</span> tie into your height protocol.
        </div>
        {Object.entries(STRETCHING).map(([k,r])=><div className="cd" key={k}>
          <div className="ch" onClick={()=>toggle("s_"+k)}>
            <div><div className="ct">{r.name}</div><div className="cs">{r.time} — after every {k} session</div></div>
            <span className={`cv ${open["s_"+k]?"o":""}`}>▶</span>
          </div>
          {open["s_"+k]&&<div style={{marginTop:10}}>
            {r.exercises.map((s,i)=><div key={i} style={{padding:"10px 0",borderBottom:i<r.exercises.length-1?"1px solid var(--bd)":"none"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:6}}>
                <div style={{fontWeight:700,fontSize:12,color:"var(--bl)"}}>{s.name}</div>
                <div style={{display:"flex",gap:6,alignItems:"center"}}>
                  <span style={{fontSize:9,padding:"1px 6px",borderRadius:3,background:`${tagColors[s.tag]}20`,color:tagColors[s.tag],fontWeight:700,textTransform:"uppercase"}}>{s.tag}</span>
                  <span style={{fontSize:10,color:"var(--pu)",fontWeight:600}}>{s.dur}</span>
                </div>
              </div>
              <div style={{fontSize:11,color:"var(--td)",marginTop:4,lineHeight:1.6}}>{s.detail}</div>
            </div>)}
          </div>}
        </div>)}
        <div className="cd" style={{marginTop:8,background:"var(--ag)",borderColor:"var(--ad)"}}>
          <div className="ct" style={{marginBottom:6}}>FLEXIBILITY PHILOSOPHY</div>
          <div style={{fontSize:11,color:"var(--tm)",lineHeight:1.7}}>
            Every exercise is chosen for <strong>full range of motion</strong>. Deep squats, full-stretch dips, dead-hang pull-ups, RDLs — all BUILD flexibility while building strength. Machines that lock you into fixed paths (leg press, Smith machine, most chest machines) restrict natural movement and CAN make you stiff. Your plan is 90% free weights + bodyweight. The few machines (cables, lat pulldown, leg curl) all allow natural movement arcs. Combined with this stretching, you'll be MORE flexible in 6 months, not less.
          </div>
        </div>
      </div>}

      {tab==="nutrition"&&<div className="s">
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7,marginBottom:14}}>
          {[{v:NUTRITION.targets.cal,l:"Calories/Day",c:"var(--acc)"},{v:NUTRITION.targets.pro,l:"Protein",c:"var(--bl)"},{v:NUTRITION.targets.carb,l:"Carbs",c:"var(--or)"},{v:NUTRITION.targets.fat,l:"Fats",c:"var(--pu)"}].map((m,i)=>
            <div key={i} style={{background:"var(--c)",border:"1px solid var(--bd)",borderRadius:6,padding:10,textAlign:"center"}}>
              <div style={{fontSize:14,fontWeight:800,color:m.c}}>{m.v}</div>
              <div style={{fontSize:9,color:"var(--td)",textTransform:"uppercase",marginTop:2}}>{m.l}</div>
            </div>
          )}
        </div>
        {NUTRITION.meals.map((mg,i)=><div className="cd" key={i}>
          <div className="ch" onClick={()=>toggle("m_"+i)}>
            <div className="ct">{mg.name}</div>
            <span className={`cv ${open["m_"+i]?"o":""}`}>▶</span>
          </div>
          {open["m_"+i]&&<div style={{marginTop:8}}>
            {mg.opts.map((o,j)=><div key={j} style={{padding:"8px 0",borderBottom:j<mg.opts.length-1?"1px solid var(--bd)":"none"}}>
              <div style={{fontWeight:700,fontSize:11}}>{o.m}</div>
              <div style={{fontSize:11,color:"var(--td)",marginTop:3,lineHeight:1.5}}>{o.d}</div>
            </div>)}
          </div>}
        </div>)}
        <div className="cd" style={{marginTop:8}}>
          <div className="ct" style={{marginBottom:6}}>RULES</div>
          {NUTRITION.rules.map((r,i)=><div key={i} style={{fontSize:11,color:"var(--tm)",padding:"5px 0",lineHeight:1.6,borderBottom:i<NUTRITION.rules.length-1?"1px solid var(--bd)":"none"}}>→ {r}</div>)}
        </div>
      </div>}

      {tab==="creatine"&&<div className="s">
        <div className="cd">
          <div className="ct" style={{marginBottom:12}}>CREATINE GUIDE</div>
          {CREATINE.map((p,i)=><div key={i} style={{padding:"10px 0",borderBottom:i<CREATINE.length-1?"1px solid var(--bd)":"none"}}>
            <div style={{fontWeight:700,fontSize:12,color:"var(--or)"}}>{p.q}</div>
            <div style={{fontSize:11,color:"var(--tm)",marginTop:4,lineHeight:1.7}}>{p.a}</div>
          </div>)}
        </div>
        <div className="cd" style={{marginTop:8,background:"var(--ag)",borderColor:"var(--ad)"}}>
          <div className="ct" style={{marginBottom:6}}>TL;DR</div>
          <div style={{fontSize:13,fontWeight:700,lineHeight:1.7}}>
            5g creatine monohydrate. Every day. Any time. Mix in water. Don't overthink it. Most effective legal supplement for muscle and strength.
          </div>
        </div>
      </div>}

      {tab==="flex"&&<div className="s">
        <div style={{fontSize:11,color:"var(--tm)",marginBottom:14,lineHeight:1.7}}>
          Wed and Sat are <strong style={{color:"var(--or)"}}>FLEX DAYS</strong>. Basketball is random for you — so these days adapt.
        </div>
        <div className="cd">
          <div className="ct" style={{marginBottom:10}}>WHAT TO DO</div>
          {FLEX_RULES.map((r,i)=><div key={i} style={{padding:"10px 0",borderBottom:i<FLEX_RULES.length-1?"1px solid var(--bd)":"none"}}>
            <div style={{fontWeight:700,fontSize:11,color:"var(--or)"}}>{r.s}</div>
            <div style={{fontSize:11,color:"var(--tm)",marginTop:4,lineHeight:1.6}}>{r.r}</div>
          </div>)}
        </div>
        <div className="cd" style={{marginTop:8}}>
          <div className="ct" style={{marginBottom:10}}>NO BASKETBALL OPTIONS</div>
          {FLEX_OPTIONS.map((o,i)=><div key={i} style={{padding:"10px 0",borderBottom:i<FLEX_OPTIONS.length-1?"1px solid var(--bd)":"none"}}>
            <div style={{fontWeight:700,fontSize:12,color:o.color}}>{o.name}</div>
            <div style={{fontSize:11,color:"var(--tm)",marginTop:4,lineHeight:1.7}}>{o.detail}</div>
          </div>)}
        </div>
      </div>}

      {tab==="growth"&&<div className="s">
        <div style={{fontSize:11,color:"var(--tm)",marginBottom:14,lineHeight:1.7}}>
          At 19 you may still have growth plate activity. Maximize your potential with these daily protocols. Items marked <strong style={{color:"var(--acc)"}}>GROWTH PROTOCOL</strong> in stretching routines connect here.
        </div>
        {GROWTH.map((g,i)=><div key={i} style={{background:"var(--ag)",border:"1px solid var(--ad)",borderRadius:7,padding:12,marginBottom:7}}>
          <div style={{fontWeight:700,fontSize:12,color:"var(--acc)"}}>{g.title}</div>
          <div style={{fontSize:11,color:"var(--tm)",marginTop:4,lineHeight:1.7}}>{g.detail}</div>
        </div>)}
      </div>}
    </div>
  );
}

export default App;
