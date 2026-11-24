#!/bin/bash
# Collect remaining images in parallel groups using plain wait.
set -u
mkdir -p /home/z/imgsearch

REMAINING=(
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
  if [ -f "/home/z/imgsearch/${name}.json" ] && [ "$(wc -c < /home/z/imgsearch/${name}.json)" -gt 50 ]; then
    echo "skip: $name (exists)"
    return
  fi
  timeout 170 z-ai image-search -q "$query" --count "$count" --gl "$gl" --no-rank 2>/dev/null \
    | sed -n '/^{/,$p' > "/home/z/imgsearch/${name}.json"
  echo "done: $name ($(wc -c < /home/z/imgsearch/${name}.json) bytes)"
}

# Launch all, 5 at a time
i=0
for job in "${REMAINING[@]}"; do
  run_one "$job" &
  i=$((i+1))
  if [ $((i % 5)) -eq 0 ]; then
    wait
  fi
done
wait
echo "REMAINING_DONE"
