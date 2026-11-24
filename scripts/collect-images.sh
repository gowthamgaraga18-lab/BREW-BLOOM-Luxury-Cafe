#!/bin/bash
# Parallel image collection for BREW & BLOOM.
# Extracts the JSON block from z-ai stdout (skips init log lines) into per-query files.
set -u
mkdir -p /home/z/imgsearch

# name|query|count|gl
JOBS=(
  "sig_lattes|luxury specialty coffee latte art top view ceramic cup|8|us"
  "espresso|espresso shot extraction crema close up glass cup|6|us"
  "cappuccino|cappuccino foam latte art white ceramic cup|6|us"
  "iced_spanish|iced spanish latte layered glass cold coffee|6|us"
  "frappe|caramel frappe blended coffee whipped cream glass|6|us"
  "cheesecake|blueberry cheesecake slice dessert plate gourmet|4|us"
  "brownie|chocolate brownie fudgy dessert plated|4|us"
  "tiramisu|tiramisu italian dessert cocoa powder|4|us"
  "redvelvet|red velvet cake slice cream cheese frosting|4|us"
  "croissant|butter croissant flaky pastry bakery golden|6|us"
  "cinnamon|cinnamon roll swirl glazed icing bakery|4|us"
  "garlicbread|garlic bread herbed baked golden|4|us"
  "cafe_interior|luxury specialty cafe interior warm wood ambiance|8|us"
  "barista|barista pouring milk latte art preparation|6|us"
  "beans|roasted coffee beans macro close up dark|4|us"
  "tea|herbal tea pot ceramic cup steam|6|us"
  "matcha|matcha latte green tea drink glass|4|us"
  "flatlay|croissant coffee cafe table flatlay top down|4|us"
  "chocplate|chocolate dessert plated gourmet fine dining|4|us"
  "beansbag|specialty coffee beans bag premium packaging|4|us"
)

run_one() {
  local line="$1"
  local name="${line%%|*}"
  local rest="${line#*|}"
  local query="${rest%%|*}"
  rest="${rest#*|}"
  local count="${rest%%|*}"
  local gl="${rest##*|}"
  timeout 170 z-ai image-search -q "$query" --count "$count" --gl "$gl" --no-rank 2>/dev/null \
    | sed -n '/^{/,$p' > "/home/z/imgsearch/${name}.json"
  echo "done: $name ($(wc -c < /home/z/imgsearch/${name}.json) bytes)"
}

# Run with a concurrency of 6
running=0
for job in "${JOBS[@]}"; do
  run_one "$job" &
  running=$((running+1))
  if [ "$running" -ge 6 ]; then
    wait -n
    running=$((running-1))
  fi
done
wait
echo "ALL_IMGSEARCH_DONE"
