import re
from datetime import datetime

def parse_recipe_text(text):
    """
    Parse raw recipe text and extract structured data.
    
    Args:
        text (str): Raw recipe text containing title, ingredients, and instructions
        
    Returns:
        dict: Structured recipe data with title, ingredients, and instructions
    """
    recipe = {
        'title': '',
        'ingredients': [],
        'instructions': [],
        'dateAdded': datetime.now().isoformat()
    }
    
    # Remove extra whitespace and normalize line endings
    text = text.strip()
    text = re.sub(r'\r\n', '\n', text)
    
    # Extract Title (first non-empty line)
    lines = text.split('\n')
    for line in lines:
        if line.strip():
            recipe['title'] = line.strip()
            break
    
    # Extract Ingredients Section
    # Pattern: Look for "Ingredients:" followed by lines until "Instructions:" or end
    ingredients_pattern = r'(?:Ingredients?|INGREDIENTS?)[\s:]*\n((?:(?!Instructions?|INSTRUCTIONS?).+\n?)+)'
    ingredients_match = re.search(ingredients_pattern, text, re.IGNORECASE | re.MULTILINE)
    
    if ingredients_match:
        ingredients_text = ingredients_match.group(1).strip()
        
        # Parse each ingredient line
        for line in ingredients_text.split('\n'):
            line = line.strip()
            if line and not line.startswith('#'):  # Skip empty lines and comments
                # Remove bullet points or numbers at start
                line = re.sub(r'^[\-\*\•\d\.]+\s*', '', line)
                
                parsed_ingredient = parse_ingredient_line(line)
                if parsed_ingredient:
                    recipe['ingredients'].append(parsed_ingredient)
    
    # Extract Instructions Section
    instructions_pattern = r'(?:Instructions?|Directions?|Steps?|Method|INSTRUCTIONS?)[\s:]*\n((?:.+\n?)+)'
    instructions_match = re.search(instructions_pattern, text, re.IGNORECASE | re.MULTILINE)
    
    if instructions_match:
        instructions_text = instructions_match.group(1).strip()
        
        # Split into individual steps
        for line in instructions_text.split('\n'):
            line = line.strip()
            if line:
                # Remove step numbers (1., 2., etc.)
                line = re.sub(r'^\d+[\.\)]\s*', '', line)
                # Remove bullet points
                line = re.sub(r'^[\-\*\•]\s*', '', line)
                
                if line:  # Only add non-empty lines
                    recipe['instructions'].append(line)
    
    return recipe


def parse_ingredient_line(line):
    """
    Parse a single ingredient line into quantity, unit, and item.
    
    Examples:
        "2 cups flour" -> {quantity: "2", unit: "cups", item: "flour"}
        "1/2 cup butter, softened" -> {quantity: "1/2", unit: "cup", item: "butter, softened"}
        "3 eggs" -> {quantity: "3", unit: "", item: "eggs"}
        "Salt to taste" -> {quantity: "", unit: "", item: "Salt to taste"}
    
    Args:
        line (str): Single ingredient line
        
    Returns:
        dict: Parsed ingredient with quantity, unit, and item
    """
    line = line.strip()
    
    # Common measurement units (extend as needed)
    units = r'(?:cups?|cup|tablespoons?|tbsps?|tbsp|teaspoons?|tsps?|tsp|ounces?|oz|pounds?|lbs?|lb|' \
            r'grams?|g|kilograms?|kg|milliliters?|ml|liters?|l|pinch|dash|cloves?|heads?|' \
            r'slices?|pieces?|cans?|packages?|boxes?|bunches?|stalks?)'
    
    # Pattern 1: Quantity + Unit + Item (e.g., "2 cups flour")
    pattern1 = r'^([\d\s\/\.\-]+)\s+(' + units + r')\s+(.+)$'
    match1 = re.match(pattern1, line, re.IGNORECASE)
    
    if match1:
        return {
            'quantity': match1.group(1).strip(),
            'unit': match1.group(2).strip(),
            'item': match1.group(3).strip()
        }
    
    # Pattern 2: Quantity + Item (no unit) (e.g., "3 eggs")
    pattern2 = r'^([\d\s\/\.\-]+)\s+(.+)$'
    match2 = re.match(pattern2, line, re.IGNORECASE)
    
    if match2:
        # Check if the second part is a unit (edge case)
        potential_unit = match2.group(2).split()[0] if match2.group(2).split() else ""
        if re.match(units, potential_unit, re.IGNORECASE):
            # It's actually quantity + unit only
            return {
                'quantity': match2.group(1).strip(),
                'unit': potential_unit,
                'item': ' '.join(match2.group(2).split()[1:]) if len(match2.group(2).split()) > 1 else ''
            }
        else:
            return {
                'quantity': match2.group(1).strip(),
                'unit': '',
                'item': match2.group(2).strip()
            }
    
    # Pattern 3: No quantity (e.g., "Salt to taste")
    return {
        'quantity': '',
        'unit': '',
        'item': line
    }


def parse_multiple_recipes(text):
    """
    Parse multiple recipes from a single text block.
    Recipes are separated by blank lines or common separators.
    
    Args:
        text (str): Text containing multiple recipes
        
    Returns:
        list: List of parsed recipe dictionaries
    """
    recipes = []
    
    # Split by common recipe separators
    # Look for patterns like "---", "===", or multiple blank lines
    recipe_blocks = re.split(r'\n\s*[-=]{3,}\s*\n|\n\s*\n\s*\n', text)
    
    for block in recipe_blocks:
        block = block.strip()
        if block and len(block) > 20:  # Minimum length to be a valid recipe
            recipe = parse_recipe_text(block)
            if recipe['title'] and (recipe['ingredients'] or recipe['instructions']):
                recipes.append(recipe)
    
    return recipes if recipes else [parse_recipe_text(text)]


def validate_recipe(recipe):
    """
    Validate that a recipe has the minimum required fields.
    
    Args:
        recipe (dict): Recipe dictionary to validate
        
    Returns:
        tuple: (is_valid, error_message)
    """
    if not recipe.get('title'):
        return False, "Recipe must have a title"
    
    if not recipe.get('ingredients') and not recipe.get('instructions'):
        return False, "Recipe must have either ingredients or instructions"
    
    return True, "Valid recipe"


# Test function
def test_parser():
    """Test the parser with sample recipe text"""
    sample_recipe = """
Chocolate Chip Cookies

Ingredients:
2 cups all-purpose flour
1 cup butter, softened
3/4 cup brown sugar
2 eggs
2 cups chocolate chips
1 tsp vanilla extract
1/2 tsp salt

Instructions:
1. Preheat oven to 375°F (190°C)
2. Cream together butter and sugar until fluffy
3. Beat in eggs one at a time
4. Gradually blend in flour and salt
5. Stir in chocolate chips and vanilla
6. Drop by rounded tablespoon onto ungreased cookie sheets
7. Bake for 9 to 11 minutes or until golden brown
8. Cool on baking sheet for 2 minutes before removing
"""
    
    print("Testing Recipe Parser...")
    print("=" * 50)
    
    recipe = parse_recipe_text(sample_recipe)
    
    print(f"Title: {recipe['title']}")
    print(f"\nIngredients ({len(recipe['ingredients'])}):")
    for ing in recipe['ingredients']:
        unit_str = f" {ing['unit']}" if ing['unit'] else ""
        print(f"  - {ing['quantity']}{unit_str} {ing['item']}")
    
    print(f"\nInstructions ({len(recipe['instructions'])}):")
    for i, step in enumerate(recipe['instructions'], 1):
        print(f"  {i}. {step}")
    
    is_valid, message = validate_recipe(recipe)
    print(f"\nValidation: {message}")
    print("=" * 50)


if __name__ == "__main__":
    # Run test when script is executed directly
    test_parser()