import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CartService } from '../cart.service';
import { environment } from '../../environments/environment';

interface MenuItem {
  name: string;
  priceText: string;
  basePrice: number;
  imageUrl?: string;
}

interface PopupItem {
  item: MenuItem;
  itemIndex: number;
  category: MenuCategory;
}

interface MenuCategory {
  name: string;
  emoji: string;
  items: MenuItem[];
}

interface CartItemMeta {
  name: string;
  basePrice: number;
  specialInstructions?: string;
}

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {
  popup: PopupItem | null = null;
  popupQty = 1;
  popupSpecialInstructions = '';

  private readonly ingredientsMap: { [name: string]: string } = {
    // Appetizers Veg
    'Cheekpeas Pepper Salt': 'chickpeas, black pepper, rock salt, cumin seeds, red chili powder, lemon juice, oil',
    'Cheek Peas Pepper Fry': 'chickpeas, black pepper, mustard seeds, curry leaves, green chili, coconut oil, salt',
    'Gobi 65': 'cauliflower florets, red chili paste, ginger garlic paste, yogurt, cornstarch, rice flour, curry leaves, food color, oil',
    'Baby Corn Manchuria': 'baby corn, ginger, garlic, green chili, soy sauce, cornstarch, bell pepper, spring onion, vinegar, oil',
    'Gobi Manchuria': 'cauliflower florets, ginger, garlic, green chili, soy sauce, cornstarch, tomato ketchup, spring onion, oil',
    'Dragon Cauliflower': 'cauliflower, red chili sauce, ginger, garlic, soy sauce, sesame seeds, spring onion, cornstarch, oil',
    'Chilli Baby Corn': 'baby corn, green chili, ginger, garlic, soy sauce, vinegar, red bell pepper, onion, cornstarch, oil',
    'Pepper Baby Corn Fry': 'baby corn, black pepper, cumin, curry leaves, mustard seeds, coconut oil, salt',
    'Karam Podi Gobi': 'cauliflower, karam podi spice mix, curry leaves, garlic, red chili, oil, salt',
    'Coriander Gobi': 'cauliflower, fresh coriander, mint leaves, green chili, ginger, garlic, lemon juice, oil, salt',
    'Veg Manchuria': 'carrot, cabbage, green beans, ginger, garlic, soy sauce, cornstarch, spring onion, green chili, oil',
    'Chilli Mushroom': 'button mushrooms, green chili, ginger, garlic, soy sauce, vinegar, bell pepper, spring onion, cornstarch, oil',
    'Chilly Paneer': 'paneer, green chili, ginger, garlic, soy sauce, onion, red bell pepper, cornstarch, spring onion, oil',
    'Coriander Paneer': 'paneer, fresh coriander, mint leaves, green chili, ginger, garlic, lemon juice, oil, salt',
    'Paneer Pakoda': 'paneer, chickpea flour, red chili powder, ajwain (carom seeds), ginger paste, baking soda, oil, salt',
    'Paneer Manchuria': 'paneer, ginger, garlic, green chili, soy sauce, spring onion, cornstarch, tomato ketchup, oil',
    'Jalapeno Paneer': 'paneer, jalapeño peppers, ginger, garlic, bell pepper, cornstarch, soy sauce, onion, oil',
    'Curry Leaf Paneer': 'paneer, curry leaves, mustard seeds, red chili, turmeric, oil, salt',
    'Charmasala Fried Paneer': 'paneer, chaat masala, cumin, red chili powder, turmeric, lemon juice, oil',
    'Karampodi Paneer': 'paneer, karam podi spice blend, curry leaves, garlic, oil, salt',
    // Appetizers Non Veg
    'Chilli Egg': 'hard-boiled eggs, green chili, ginger, garlic, soy sauce, vinegar, onion, bell pepper, cornstarch, spring onion, oil',
    'Chowanam Fried Chicken': 'chicken, ginger garlic paste, red chili paste, lemon juice, cornstarch, curry leaves, rice flour, oil',
    // Breakfast Combos
    'Idly + 1 Vada': 'rice, urad dal, water, salt (idly); urad dal, rice flour, cumin seeds, green chili, ginger, curry leaves, oil (vada)',
    'Vada + 1 Bonda': 'urad dal, rice flour, cumin, green chili, ginger, curry leaves, oil (vada); potato, mustard seeds, turmeric, gram flour, green chili, oil (bonda)',
    'Idly + Upma / Pongal': 'rice, urad dal, salt (idly); semolina, onion, mustard seeds, curry leaves, green chili, ginger, cashews, oil (upma); rice, moong dal, ghee, cumin, black pepper, ginger, curry leaves, cashews (pongal)',
    // Snack Box
    'Samosa (2 Pcs)': 'all-purpose flour, potato, green peas, cumin seeds, coriander, garam masala, ginger, amchur, oil',
    'Onion Samosa (2 Pcs)': 'all-purpose flour, onion, green chili, cumin seeds, coriander seeds, salt, oil',
    'Alu Samosa + Paya Vada (2 pcs)': 'all-purpose flour, potato, green peas, onion, spices, oil; urad dal, paya (trotter) stock, spices, oil',
    'Onion Spinach Pakora': 'onion, spinach, gram flour, green chili, cumin seeds, ajwain, red chili powder, oil, salt',
    'Mirchi Bajji (4 pcs)': 'large green chili, gram flour, red chili powder, cumin, salt, tamarind chutney, oil',
    'Punugulu (10 pcs)': 'urad dal fermented batter, rice flour, onion, cumin seeds, green chili, ginger, oil, salt',
    'Stuffed Mirchi (3 pcs)': 'large green chili, potato filling, roasted peanuts, fresh coconut, spices, tamarind, oil',
    // Chaat Section
    'Vada Pav': 'potato vada, bread bun, green chutney, tamarind chutney, dry red chili chutney, garlic, red chili powder, chaat masala, oil',
    'Pani Puri (5 pcs)': 'semolina shells, mint infused water, tamarind water, potato, chickpeas, cumin, coriander, chaat masala, black salt',
    // Tiffins/Dosas
    'Idly (3 pcs)': 'rice, urad dal, water, salt',
    'Vada (2 pcs)': 'urad dal, rice flour, cumin seeds, green chili, ginger, curry leaves, black pepper, oil',
    'Upma': 'semolina, onion, mustard seeds, curry leaves, green chili, ginger, cashews, oil, salt',
    'Pongal': 'rice, moong dal, ghee, cumin seeds, black pepper, ginger, curry leaves, cashews, salt',
    'Ghee Karam Idly (3 pcs)': 'rice, urad dal, ghee, karam podi (red chili, cumin, garlic, urad dal), salt',
    'Sambar Idly (2 pcs)': 'rice, urad dal (idly); toor dal, tamarind, tomato, onion, sambar powder, curry leaves, mustard seeds, oil (sambar)',
    'Sambar Vada (2 pcs)': 'urad dal, rice flour, cumin, green chili (vada); toor dal, tamarind, tomato, onion, sambar powder, curry leaves (sambar)',
    'Mysore Bonda (3 pcs)': 'urad dal, fresh coconut, ginger, green chili, cumin seeds, curry leaves, salt, oil',
    'Plain Dosa': 'rice, urad dal, water, salt, oil',
    'Masala Dosa': 'rice, urad dal (dosa); potato, onion, mustard seeds, turmeric, green chili, curry leaves, oil (filling)',
    'Mysore Masala Dosa': 'rice, urad dal (dosa); red chili garlic coconut chutney, potato, onion, mustard seeds, turmeric (filling)',
    'Onion Dosa': 'rice, urad dal, onion, green chili, fresh coriander, oil, salt',
    'Podi Karam Dosa': 'rice, urad dal, karam podi (sesame seeds, red chili, urad dal), ghee, oil',
    'Guntur Karam Dosa': 'rice, urad dal, Guntur red chili powder, garlic, cumin seeds, sesame oil',
    'Annam Cheese Dosa': 'rice, urad dal, cheddar cheese, butter, green chili, fresh coriander, oil',
    'Nutella Dosa': 'rice, urad dal, Nutella (hazelnuts, cocoa, sugar, palm oil, skimmed milk, vanilla), butter',
    'Paneer Dosa': 'rice, urad dal (dosa); paneer, onion, green chili, fresh coriander, oil (filling)',
    'Ghee Karam Dosa': 'rice, urad dal, ghee, karam podi (red chili, cumin, garlic, sesame), oil',
    'Gongura Onion Dosa': 'rice, urad dal, gongura (sorrel) leaves, onion, green chili, red chili, oil, salt',
    'Egg Dosa': 'rice, urad dal, egg, onion, green chili, black pepper, fresh coriander, oil',
    'Chicken 65 Dosa': 'rice, urad dal (dosa); chicken, red chili paste, ginger garlic paste, curry leaves, yogurt, cornstarch, oil (filling)',
    'Chicken Keema Dosa': 'rice, urad dal (dosa); minced chicken, onion, tomato, ginger garlic paste, cumin, garam masala, oil (filling)',
    // Veg Gravies
    'Yellow Dal Tadka': 'toor dal, ghee, mustard seeds, cumin seeds, red chili, garlic, curry leaves, tomato, onion, turmeric',
    'Mix Vegetable Curry': 'potato, carrot, green beans, peas, onion, tomato, ginger, garlic, garam masala, cumin, coriander, turmeric, oil',
    'Kadai Veg Curry': 'mixed vegetables, coriander seeds, cumin, red chili, capsicum, tomato, ginger garlic paste, cream, oil',
    'Navratan Korma Veg': 'carrot, potato, peas, beans, corn, paneer, cashews, raisins, cream, saffron, cardamom, rose water, ghee',
    'Chana Masala': 'chickpeas, onion, tomato, ginger, garlic, cumin, coriander powder, garam masala, amchur, red chili, oil',
    'Palak Chana': 'chickpeas, spinach, onion, tomato, ginger, garlic, cumin, coriander, garam masala, oil, salt',
    'Aloo Gobi': 'potato, cauliflower, onion, tomato, ginger, garlic, cumin seeds, turmeric, coriander, garam masala, oil',
    'Gutti Vankaya Curry': 'baby brinjal, roasted peanuts, sesame seeds, fresh coconut, onion, tamarind, gongura leaves, cumin, coriander, oil',
    'Bhindi Masala': 'okra, onion, tomato, ginger, garlic, cumin seeds, coriander, amchur, red chili, garam masala, oil',
    'Malai Kofta': 'potato, paneer (kofta balls); cashew paste, tomato, onion, cream, cardamom, saffron, ginger, garlic, ghee',
    'Kaju Matar': 'cashew nuts, green peas, onion, tomato, cream, cardamom, ginger, garlic, garam masala, oil',
    'Navratan Korma': 'nine mixed vegetables, nuts (cashews, almonds), dried fruits, cream, saffron, cardamom, rose water, ghee',
    'Mushroom Masala': 'button mushrooms, onion, tomato, ginger, garlic, cumin seeds, coriander, garam masala, cream, oil',
    'Kaju Masala': 'cashew nuts, onion, tomato, cream, cardamom, bay leaf, garam masala, ginger garlic paste, oil',
    'Kaju Capsicum Masala': 'cashew nuts, bell pepper, onion, tomato, cream, ginger, garlic, cardamom, garam masala, oil',
    'Achari Handi Masala': 'mixed vegetables, fenugreek seeds, mustard seeds, kalonji (nigella), fennel seeds, vinegar, oil, turmeric',
    'Veg Kheema Masala': 'soy granules, onion, tomato, green peas, ginger, garlic, cumin, garam masala, coriander, red chili, oil',
    'Paneer Butter Masala': 'paneer, butter, tomato, onion, cashew paste, cream, ginger, garlic, kasoori methi, garam masala',
    'Paneer Tikka Masala': 'paneer, yogurt, tomato, onion, cream, ginger garlic paste, kasoori methi, garam masala, red chili, oil',
    'Palak Paneer': 'spinach, paneer, onion, tomato, ginger, garlic, cream, cumin seeds, garam masala, ghee',
    'Kadai Paneer': 'paneer, bell pepper, onion, tomato, coriander seeds, cumin, red chili, ginger, garlic, cream, oil',
    'Methi Paneer': 'paneer, fenugreek leaves, onion, tomato, ginger, garlic, cream, cumin seeds, garam masala, oil',
    // Mandi Specials
    'Paneer Juicy Mandi': 'basmati rice, paneer, saffron, cardamom, cinnamon, cloves, black pepper, onion, ghee, mandi spice blend',
    'Veg Mandi': 'basmati rice, mixed vegetables, saffron, cardamom, cinnamon, cloves, bay leaf, onion, ghee, mandi spice blend',
    'Egg Mandi': 'basmati rice, hard-boiled eggs, saffron, cardamom, cinnamon, cloves, onion, ghee, mandi spice blend',
    'Chicken Fry Piece Mandi': 'basmati rice, fried chicken pieces, saffron, cardamom, cinnamon, cloves, black pepper, ghee, mandi spice blend',
    'Juicy Chicken Mandi': 'basmati rice, whole chicken, saffron, cardamom, cinnamon, cloves, black lime (loomi), onion, ghee, mandi spice',
    'Spicy Chicken Mandi': 'basmati rice, chicken, red chili, saffron, ginger, garlic, cinnamon, cardamom, cumin, ghee',
    'Afghani Chicken Mandi': 'basmati rice, chicken, heavy cream, yogurt, saffron, cardamom, cinnamon, cloves, white pepper, ghee',
    'Ghee Roast Mutton Mandi': 'basmati rice, mutton, ghee, saffron, cinnamon, cardamom, cloves, black lime, onion, mandi spice',
    'Afghani Mutton Mandi': 'basmati rice, mutton, cream, yogurt, saffron, cardamom, white pepper, ghee, mandi spice blend',
    'Spicy Shrimp Mandi': 'basmati rice, shrimp, red chili, saffron, garlic, ginger, cinnamon, cardamom, cumin, ghee',
    // Dum Biryani
    'Veg Biryani': 'basmati rice, mixed vegetables, saffron, cardamom, cinnamon, cloves, bay leaf, fried onion, mint, ghee, yogurt',
    'Gongura Veg Biryani': 'basmati rice, gongura (sorrel) leaves, vegetables, saffron, whole spices, fried onion, mint, ghee',
    'Ulavacharu Biryani': 'basmati rice, horse gram broth, saffron, cardamom, cinnamon, cloves, bay leaf, fried onion, ghee',
    'Chicken Dum Biryani': 'basmati rice, chicken, saffron, cardamom, cinnamon, cloves, yogurt, fried onion, mint, ghee, rose water',
    'Gongura Chicken Dum': 'basmati rice, chicken, gongura (sorrel) leaves, saffron, cardamom, cinnamon, cloves, fried onion, ghee',
    'Ulavacharu Chicken Dum': 'basmati rice, chicken, horse gram broth, saffron, cardamom, cinnamon, cloves, fried onion, ghee',
    'Avakai Dum': 'basmati rice, raw mango pickle (avakai), chicken, saffron, cardamom, cinnamon, cloves, fried onion, ghee',
    'Goat Dum': 'basmati rice, goat meat, saffron, cardamom, cinnamon, cloves, yogurt, fried onion, mint, ghee, rose water',
    'Gongura Goat Dum': 'basmati rice, goat meat, gongura (sorrel) leaves, saffron, cardamom, cinnamon, cloves, fried onion, ghee',
    // Non Veg Gravies
    'Egg Masala': 'hard-boiled eggs, onion, tomato, ginger, garlic, red chili, cumin seeds, coriander, garam masala, oil',
    'Egg Burji Dhaba Style': 'scrambled eggs, onion, tomato, green chili, ginger, garlic, cumin seeds, coriander, cream, oil',
    'Butter Chicken': 'chicken, butter, tomato, onion, cream, ginger garlic paste, kasoori methi, garam masala, red chili, cardamom',
    'Chicken Tikka Masala': 'chicken, yogurt, tomato, onion, cream, ginger garlic paste, kasoori methi, garam masala, red chili, oil',
    'Chowrasta Special Chicken': 'chicken, onion, tomato, green chili, ginger, garlic, coriander, cumin, garam masala, curry leaves, oil',
    'Andhra Chicken Curry': 'chicken, onion, tomato, Andhra red chili, ginger, garlic, coconut, curry leaves, turmeric, oil',
    'Dhaba Style Chicken': 'chicken, onion, tomato, cream, ginger, garlic, cumin, coriander, garam masala, butter, kasoori methi',
    'Malai Methi Chicken': 'chicken, heavy cream, fenugreek leaves, onion, ginger, garlic, cardamom, cashew paste, white pepper',
    'Chicken Vindaloo': 'chicken, vinegar, red chili, ginger, garlic, mustard seeds, cumin, cinnamon, cloves, turmeric',
    'Chettinad Chicken Curry': 'chicken, Chettinad masala (kalpasi, marathi mokku, star anise, kalpasi), coconut, onion, tomato, curry leaves',
    'Palak Chicken Curry': 'chicken, spinach, onion, tomato, ginger, garlic, cream, cumin seeds, garam masala, oil',
    'Kadai Chicken': 'chicken, bell pepper, onion, tomato, coriander seeds, cumin, red chili, ginger garlic paste, cream, oil',
    'Mughlai Chicken Curry': 'chicken, cream, onion, cashew paste, yogurt, saffron, cardamom, rose water, ghee',
    'Gongura Chicken Curry': 'chicken, gongura (sorrel) leaves, onion, tomato, red chili, ginger, garlic, curry leaves, oil',
    'Kadhai Chicken': 'chicken, bell pepper, onion, tomato, kadai masala (coriander, cumin, red chili, peppercorn), ginger garlic paste, oil',
    'Achari Chicken': 'chicken, pickling spices (mustard seeds, fennel, kalonji, fenugreek), yogurt, onion, vinegar, turmeric',
    'Chicken Kheema Curry': 'minced chicken, onion, tomato, green peas, ginger, garlic, cumin, coriander, garam masala, oil',
    'Chowrasta Special Goat': 'goat meat, special chowrasta masala blend, onion, tomato, ginger, garlic, curry leaves, coriander, oil',
    'Andhra Goat': 'goat meat, Andhra red chili, onion, tomato, fresh coconut, ginger, garlic, curry leaves, turmeric, oil',
    'Dhaba Style Goat': 'goat meat, onion, cream, tomato, cumin, coriander, garam masala, ginger, garlic, ghee',
    'Goat Vindaloo': 'goat meat, vinegar, red chili, ginger, garlic, mustard seeds, cumin, cinnamon, cloves, turmeric',
    'Chettinad Goat Curry': 'goat meat, Chettinad spices (kalpasi, star anise, kalpasi), fresh coconut, onion, tomato, curry leaves',
    'Palak Goat Curry': 'goat meat, spinach, onion, tomato, ginger, garlic, cream, cumin seeds, garam masala, oil',
    // Rice Specials
    'Jeera Rice': 'basmati rice, cumin seeds, ghee, bay leaf, cloves, cardamom, salt',
    'Curd Rice': 'cooked rice, yogurt, milk, mustard seeds, curry leaves, green chili, ginger, pomegranate seeds, oil',
    'Sambar Rice': 'cooked rice, toor dal, tamarind, tomato, onion, sambar powder, mustard seeds, curry leaves, ghee',
    'Pulav Rice': 'basmati rice, mixed vegetables, whole spices (cardamom, cinnamon, cloves), ghee, mint, fried onion, saffron',
    // Hot Beverages
    'Irani Chai Large': 'black tea, whole milk, sugar, cardamom, condensed milk',
    'Irani Chai Small': 'black tea, whole milk, sugar, cardamom, condensed milk',
    'Masala Chai': 'black tea, milk, ginger, cardamom, cloves, cinnamon, black pepper, sugar',
    // Cold Beverages
    'Mango Lassi': 'mango pulp, yogurt, milk, sugar, cardamom, rose water',
    'Milk Shakes (Choco/Strawberry Mix)': 'milk, chocolate syrup, strawberry syrup, vanilla ice cream, sugar, cream',
    'Fresh Fruit Juice (Orange/Pineapple/Muskmelon)': 'fresh orange juice or pineapple juice or muskmelon juice, ice, sugar (optional)',
    'Oreo Shake': 'Oreo cookies, whole milk, vanilla ice cream, sugar, whipped cream',
    'Chocolate Shake': 'cocoa powder, whole milk, chocolate ice cream, sugar, vanilla extract, whipped cream',
    'Sugar Cane Juice': 'fresh sugar cane, ginger, mint leaves, lemon juice, ice'
  };

  private readonly categoryColors: { [key: string]: string } = {
    'Appetizers Veg':      'linear-gradient(135deg, #e65c00, #f9d423)',
    'Appetizers Non Veg':  'linear-gradient(135deg, #c0392b, #e67e22)',
    'Breakfast Combos':    'linear-gradient(135deg, #f39c12, #f1c40f)',
    'Snack Box':           'linear-gradient(135deg, #d35400, #f39c12)',
    'Chaat Section':       'linear-gradient(135deg, #e74c3c, #f39c12)',
    'Tiffins/Dosas':       'linear-gradient(135deg, #ca6f1e, #f0b27a)',
    'Veg Gravies':         'linear-gradient(135deg, #27ae60, #f39c12)',
    'Mandi Specials':      'linear-gradient(135deg, #a04000, #e59866)',
    'Dum Biryani':         'linear-gradient(135deg, #b7950b, #f4d03f)',
    'Non Veg Gravies':     'linear-gradient(135deg, #922b21, #e74c3c)',
    'Rice Specials':       'linear-gradient(135deg, #1a5276, #2e86c1)',
    'Hot Beverages':       'linear-gradient(135deg, #4a235a, #884ea0)',
    'Cold Beverages':      'linear-gradient(135deg, #1a5276, #85c1e9)',
  };
  categories: MenuCategory[] = [
    {
      name: 'Appetizers Veg',
      emoji: '🍽️',
      items: [
        { name: 'Cheekpeas Pepper Salt',    priceText: '$10.99', basePrice: 10.99, imageUrl: 'assets/menu-images/Cheekpeas Pepper Salt.jpeg' },
        { name: 'Cheek Peas Pepper Fry',    priceText: '$10.99', basePrice: 10.99, imageUrl: 'assets/menu-images/Cheek Peas Pepper Fry.jpeg' },
        { name: 'Gobi 65',                  priceText: '$10.99', basePrice: 10.99, imageUrl: 'assets/menu-images/Gobi 65.jpeg' },
        { name: 'Baby Corn Manchuria',       priceText: '$10.99', basePrice: 10.99, imageUrl: 'assets/menu-images/Baby Corn Manchuria.jpeg' },
        { name: 'Gobi Manchuria',            priceText: '$10.99', basePrice: 10.99, imageUrl: 'assets/menu-images/Gobi Manchuria.jpeg' },
        { name: 'Dragon Cauliflower',        priceText: '$10.99', basePrice: 10.99, imageUrl: 'assets/menu-images/Dragon Cauliflower.jpeg' },
        { name: 'Chilli Baby Corn',          priceText: '$10.99', basePrice: 10.99, imageUrl: 'assets/menu-images/Chilli Baby Corn.jpeg' },
        { name: 'Pepper Baby Corn Fry',      priceText: '$10.99', basePrice: 10.99, imageUrl: 'assets/menu-images/Pepper Baby Corn Fry.jpeg' },
        { name: 'Karam Podi Gobi',           priceText: '$10.99', basePrice: 10.99, imageUrl: 'assets/menu-images/Karam Podi Gobi.jpeg' },
        { name: 'Coriander Gobi',            priceText: '$10.99', basePrice: 10.99, imageUrl: 'assets/menu-images/Coriander Gobi.jpeg' },
        { name: 'Veg Manchuria',             priceText: '$10.99', basePrice: 10.99, imageUrl: 'assets/menu-images/Veg Manchuria.jpeg' },
        { name: 'Chilli Mushroom',           priceText: '$11.99', basePrice: 11.99, imageUrl: 'assets/menu-images/Chilli Mushroom.jpeg' },
        { name: 'Chilly Paneer',             priceText: '$11.99', basePrice: 11.99, imageUrl: 'assets/menu-images/Chilly Paneer.jpeg' },
        { name: 'Coriander Paneer',          priceText: '$12.99', basePrice: 12.99, imageUrl: 'assets/menu-images/Coriander Paneer.jpeg' },
        { name: 'Paneer Pakoda',             priceText: '$12.99', basePrice: 12.99, imageUrl: 'assets/menu-images/Paneer Pakoda.jpeg' },
        { name: 'Paneer Manchuria',          priceText: '$12.99', basePrice: 12.99, imageUrl: 'assets/menu-images/Paneer Manchuria.jpeg' },
        { name: 'Jalapeno Paneer',           priceText: '$12.99', basePrice: 12.99, imageUrl: 'assets/menu-images/Jalapeno Paneer.jpeg' },
        { name: 'Curry Leaf Paneer',         priceText: '$12.99', basePrice: 12.99, imageUrl: 'assets/menu-images/Curry Leaf Paneer.jpeg' },
        { name: 'Charmasala Fried Paneer',   priceText: '$12.99', basePrice: 12.99, imageUrl: 'assets/menu-images/Charmasala Fried Paneer.jpeg' },
        { name: 'Karampodi Paneer',          priceText: '$12.99', basePrice: 12.99, imageUrl: 'assets/menu-images/Karampodi Paneer.jpeg' }
      ]
    },
    {
      name: 'Appetizers Non Veg',
      emoji: '🍗',
      items: [
        { name: 'Chilli Egg',            priceText: '$12.99', basePrice: 12.99, imageUrl: 'assets/menu-images/Chilli Egg.jpeg' },
        { name: 'Chowanam Fried Chicken', priceText: '$12.99', basePrice: 12.99, imageUrl: 'assets/menu-images/Chowanam Fried Chicken.jpeg' }
      ]
    },
    {
      name: 'Breakfast Combos',
      emoji: '🥞',
      items: [
        { name: 'Idly + 1 Vada',        priceText: '$5.99', basePrice: 5.99, imageUrl: 'assets/menu-images/Idly + 1 Vada.jpeg' },
        { name: 'Vada + 1 Bonda',        priceText: '$7.99', basePrice: 7.99, imageUrl: 'assets/menu-images/Vada + 1 Bonda.jpeg' },
        { name: 'Idly + Upma / Pongal',  priceText: '$8.99', basePrice: 8.99, imageUrl: 'assets/menu-images/Idly + Upma : Pongal.jpeg' }
      ]
    },
    {
      name: 'Snack Box',
      emoji: '🍟',
      items: [
        { name: 'Samosa (2 Pcs)',                    priceText: '$4.99', basePrice: 4.99, imageUrl: 'assets/menu-images/Samosa (2 Pcs).jpeg' },
        { name: 'Onion Samosa (2 Pcs)',              priceText: '$6.99', basePrice: 6.99, imageUrl: 'assets/menu-images/Onion Samosa (2 Pcs).jpeg' },
        { name: 'Alu Samosa + Paya Vada (2 pcs)',    priceText: '$6.99', basePrice: 6.99 },
        { name: 'Onion Spinach Pakora',              priceText: '$6.99', basePrice: 6.99, imageUrl: 'assets/menu-images/Onion Spinach Pakora.jpeg' },
        { name: 'Mirchi Bajji (4 pcs)',              priceText: '$6.99', basePrice: 6.99, imageUrl: 'assets/menu-images/Mirchi Bajji (4 pcs).jpeg' },
        { name: 'Punugulu (10 pcs)',                 priceText: '$6.99', basePrice: 6.99, imageUrl: 'assets/menu-images/Punugulu (10 pcs).jpeg' },
        { name: 'Stuffed Mirchi (3 pcs)',            priceText: '$6.99', basePrice: 6.99, imageUrl: 'assets/menu-images/Stuffed Mirchi (3 pcs).jpeg' }
      ]
    },
    {
      name: 'Chaat Section',
      emoji: '🍲',
      items: [
        { name: 'Vada Pav',        priceText: '$6.99', basePrice: 6.99, imageUrl: 'assets/menu-images/Vada Pav.jpeg' },
        { name: 'Pani Puri (5 pcs)', priceText: '$6.99', basePrice: 6.99, imageUrl: 'assets/menu-images/Pani Puri (5 pcs).jpeg' }
      ]
    },
    {
      name: 'Tiffins/Dosas',
      emoji: '🫓',
      items: [
        { name: 'Idly (3 pcs)', priceText: '$7.99', basePrice: 7.99, imageUrl: 'https://images.unsplash.com/photo-1741376509253-221ac18fac0f?w=400&auto=format&fit=crop&q=80' },
        { name: 'Vada (2 pcs)', priceText: '$7.99', basePrice: 7.99, imageUrl: 'https://images.unsplash.com/photo-1756757077703-26dc3ba7e853?w=400&auto=format&fit=crop&q=80' },
        { name: 'Upma', priceText: '$7.99', basePrice: 7.99, imageUrl: 'https://images.unsplash.com/photo-1665660710687-b44c50751054?w=400&auto=format&fit=crop&q=80' },
        { name: 'Pongal', priceText: '$7.99', basePrice: 7.99, imageUrl: 'https://images.unsplash.com/photo-1741376509360-3b7877b796d5?w=400&auto=format&fit=crop&q=80' },
        { name: 'Ghee Karam Idly (3 pcs)', priceText: '$8.99', basePrice: 8.99, imageUrl: 'https://images.unsplash.com/photo-1741376509166-cbd74b608f5a?w=400&auto=format&fit=crop&q=80' },
        { name: 'Sambar Idly (2 pcs)', priceText: '$8.99', basePrice: 8.99, imageUrl: 'https://images.unsplash.com/photo-1741376509047-66dae5df90f9?w=400&auto=format&fit=crop&q=80' },
        { name: 'Sambar Vada (2 pcs)', priceText: '$8.99', basePrice: 8.99, imageUrl: 'https://images.unsplash.com/photo-1707425197254-266fec098cae?w=400&auto=format&fit=crop&q=80' },
        { name: 'Mysore Bonda (3 pcs)', priceText: '$8.99', basePrice: 8.99, imageUrl: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400&auto=format&fit=crop&q=80' },
        { name: 'Plain Dosa', priceText: '$8.99', basePrice: 8.99, imageUrl: 'https://images.unsplash.com/photo-1743517894265-c86ab035adef?w=400&auto=format&fit=crop&q=80' },
        { name: 'Masala Dosa', priceText: '$10.99', basePrice: 10.99, imageUrl: 'https://images.unsplash.com/photo-1743615467204-8fdaa85ff2db?w=400&auto=format&fit=crop&q=80' },
        { name: 'Mysore Masala Dosa', priceText: '$10.99', basePrice: 10.99, imageUrl: 'https://images.unsplash.com/photo-1662174485500-6d32a13c060e?w=400&auto=format&fit=crop&q=80' },
        { name: 'Onion Dosa', priceText: '$10.99', basePrice: 10.99, imageUrl: 'https://images.unsplash.com/photo-1613744033489-5fd69e431d4a?w=400&auto=format&fit=crop&q=80' },
        { name: 'Podi Karam Dosa', priceText: '$10.99', basePrice: 10.99, imageUrl: 'https://images.unsplash.com/photo-1771074168436-8692a866cdb1?w=400&auto=format&fit=crop&q=80' },
        { name: 'Guntur Karam Dosa', priceText: '$10.99', basePrice: 10.99, imageUrl: 'https://images.unsplash.com/photo-1756821753226-c0fc88056cf7?w=400&auto=format&fit=crop&q=80' },
        { name: 'Annam Cheese Dosa', priceText: '$11.99', basePrice: 11.99, imageUrl: 'https://images.unsplash.com/photo-1757715376287-90f24dac4593?w=400&auto=format&fit=crop&q=80' },
        { name: 'Nutella Dosa', priceText: '$11.99', basePrice: 11.99, imageUrl: 'https://images.unsplash.com/photo-1654722487269-29469154bf82?w=400&auto=format&fit=crop&q=80' },
        { name: 'Paneer Dosa', priceText: '$11.99', basePrice: 11.99, imageUrl: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&auto=format&fit=crop&q=80' },
        { name: 'Ghee Karam Dosa', priceText: '$11.99', basePrice: 11.99, imageUrl: 'https://images.unsplash.com/photo-1742599361574-6fb156181466?w=400&auto=format&fit=crop&q=80' },
        { name: 'Gongura Onion Dosa', priceText: '$11.99', basePrice: 11.99, imageUrl: 'https://images.unsplash.com/photo-1606843046080-45bf7a23c39f?w=400&auto=format&fit=crop&q=80' },
        { name: 'Egg Dosa', priceText: '$11.99', basePrice: 11.99, imageUrl: 'https://images.unsplash.com/photo-1764315197254-94385571df22?w=400&auto=format&fit=crop&q=80' },
        { name: 'Chicken 65 Dosa', priceText: '$11.99', basePrice: 11.99, imageUrl: 'https://images.unsplash.com/photo-1742599361539-f096753d1100?w=400&auto=format&fit=crop&q=80' },
        { name: 'Chicken Keema Dosa', priceText: '$12.99', basePrice: 12.99, imageUrl: 'https://images.unsplash.com/photo-1772730065344-4cf131b39951?w=400&auto=format&fit=crop&q=80' }
      ]
    },
    {
      name: 'Veg Gravies',
      emoji: '🍛',
      items: [
        { name: 'Yellow Dal Tadka', priceText: '$11.99', basePrice: 11.99, imageUrl: 'https://images.unsplash.com/photo-1756821753095-64134f5c0c5c?w=400&auto=format&fit=crop&q=80' },
        { name: 'Mix Vegetable Curry', priceText: '$12.99', basePrice: 12.99, imageUrl: 'https://images.unsplash.com/photo-1756821753226-c0fc88056cf7?w=400&auto=format&fit=crop&q=80' },
        { name: 'Kadai Veg Curry', priceText: '$12.99', basePrice: 12.99, imageUrl: 'https://images.unsplash.com/photo-1723476662512-6abc972f1167?w=400&auto=format&fit=crop&q=80' },
        { name: 'Navratan Korma Veg', priceText: '$12.99', basePrice: 12.99, imageUrl: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&auto=format&fit=crop&q=80' },
        { name: 'Chana Masala', priceText: '$12.99', basePrice: 12.99, imageUrl: 'https://images.unsplash.com/photo-1771074168436-8692a866cdb1?w=400&auto=format&fit=crop&q=80' },
        { name: 'Palak Chana', priceText: '$12.99', basePrice: 12.99, imageUrl: 'https://images.unsplash.com/photo-1589647363585-f4a7d3877b10?w=400&auto=format&fit=crop&q=80' },
        { name: 'Aloo Gobi', priceText: '$12.99', basePrice: 12.99, imageUrl: 'https://images.unsplash.com/photo-1613744033489-5fd69e431d4a?w=400&auto=format&fit=crop&q=80' },
        { name: 'Gutti Vankaya Curry', priceText: '$12.99', basePrice: 12.99, imageUrl: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400&auto=format&fit=crop&q=80' },
        { name: 'Bhindi Masala', priceText: '$13.99', basePrice: 13.99, imageUrl: 'https://images.unsplash.com/photo-1707425197254-266fec098cae?w=400&auto=format&fit=crop&q=80' },
        { name: 'Malai Kofta', priceText: '$13.99', basePrice: 13.99, imageUrl: 'https://images.unsplash.com/photo-1742599361498-79824d24e355?w=400&auto=format&fit=crop&q=80' },
        { name: 'Kaju Matar', priceText: '$13.99', basePrice: 13.99, imageUrl: 'https://images.unsplash.com/photo-1707448829764-9474458021ed?w=400&auto=format&fit=crop&q=80' },
        { name: 'Navratan Korma', priceText: '$13.99', basePrice: 13.99, imageUrl: 'https://images.unsplash.com/photo-1742599361539-f096753d1100?w=400&auto=format&fit=crop&q=80' },
        { name: 'Mushroom Masala', priceText: '$14.99', basePrice: 14.99, imageUrl: 'https://images.unsplash.com/photo-1772469597765-ff29d5616fb7?w=400&auto=format&fit=crop&q=80' },
        { name: 'Kaju Masala', priceText: '$14.99', basePrice: 14.99, imageUrl: 'https://images.unsplash.com/photo-1757715376287-90f24dac4593?w=400&auto=format&fit=crop&q=80' },
        { name: 'Kaju Capsicum Masala', priceText: '$14.99', basePrice: 14.99, imageUrl: 'https://images.unsplash.com/photo-1654722487269-29469154bf82?w=400&auto=format&fit=crop&q=80' },
        { name: 'Achari Handi Masala', priceText: '$14.99', basePrice: 14.99, imageUrl: 'https://images.unsplash.com/photo-1775039983802-b3eb3f68cd2c?w=400&auto=format&fit=crop&q=80' },
        { name: 'Veg Kheema Masala', priceText: '$14.99', basePrice: 14.99, imageUrl: 'https://images.unsplash.com/photo-1772730065344-4cf131b39951?w=400&auto=format&fit=crop&q=80' },
        { name: 'Paneer Butter Masala', priceText: '$14.99', basePrice: 14.99, imageUrl: 'https://images.unsplash.com/photo-1764304733301-3a9f335f0c67?w=400&auto=format&fit=crop&q=80' },
        { name: 'Paneer Tikka Masala', priceText: '$14.99', basePrice: 14.99, imageUrl: 'https://images.unsplash.com/photo-1742599361574-6fb156181466?w=400&auto=format&fit=crop&q=80' },
        { name: 'Palak Paneer', priceText: '$14.99', basePrice: 14.99, imageUrl: 'https://images.unsplash.com/photo-1767114915936-745dd372f1d8?w=400&auto=format&fit=crop&q=80' },
        { name: 'Kadai Paneer', priceText: '$14.99', basePrice: 14.99, imageUrl: 'https://images.unsplash.com/photo-1764315197254-94385571df22?w=400&auto=format&fit=crop&q=80' },
        { name: 'Methi Paneer', priceText: '$14.99', basePrice: 14.99, imageUrl: 'https://images.unsplash.com/photo-1752673508949-f4aeeaef75f0?w=400&auto=format&fit=crop&q=80' }
      ]
    },
    {
      name: 'Mandi Specials',
      emoji: '🍗',
      items: [
        { name: 'Paneer Juicy Mandi', priceText: '$23.99 / $41.99 / $61.99', basePrice: 23.99, imageUrl: 'https://images.unsplash.com/photo-1752673508949-f4aeeaef75f0?w=400&auto=format&fit=crop&q=80' },
        { name: 'Veg Mandi', priceText: '$23.99 / $41.99', basePrice: 23.99, imageUrl: 'https://images.unsplash.com/photo-1756821753095-64134f5c0c5c?w=400&auto=format&fit=crop&q=80' },
        { name: 'Egg Mandi', priceText: '$21.99 / $41.99', basePrice: 21.99, imageUrl: 'https://images.unsplash.com/photo-1764315197254-94385571df22?w=400&auto=format&fit=crop&q=80' },
        { name: 'Chicken Fry Piece Mandi', priceText: '$21.99 / $41.99', basePrice: 21.99, imageUrl: 'https://images.unsplash.com/photo-1775039983802-b3eb3f68cd2c?w=400&auto=format&fit=crop&q=80' },
        { name: 'Juicy Chicken Mandi', priceText: '$23.99 / $45.99 / $67.99', basePrice: 23.99, imageUrl: 'https://images.unsplash.com/photo-1772469597765-ff29d5616fb7?w=400&auto=format&fit=crop&q=80' },
        { name: 'Spicy Chicken Mandi', priceText: '$23.99 / $45.99 / $67.99', basePrice: 23.99, imageUrl: 'https://images.unsplash.com/photo-1742599361539-f096753d1100?w=400&auto=format&fit=crop&q=80' },
        { name: 'Afghani Chicken Mandi', priceText: '$23.99 / $45.99 / $67.99', basePrice: 23.99, imageUrl: 'https://images.unsplash.com/photo-1772730065344-4cf131b39951?w=400&auto=format&fit=crop&q=80' },
        { name: 'Ghee Roast Mutton Mandi', priceText: '$24.99 / $47.99', basePrice: 24.99, imageUrl: 'https://images.unsplash.com/photo-1606843046080-45bf7a23c39f?w=400&auto=format&fit=crop&q=80' },
        { name: 'Afghani Mutton Mandi', priceText: '$24.99 / $47.99', basePrice: 24.99, imageUrl: 'https://images.unsplash.com/photo-1654722487269-29469154bf82?w=400&auto=format&fit=crop&q=80' },
        { name: 'Spicy Shrimp Mandi', priceText: '$24.99 / $47.99', basePrice: 24.99, imageUrl: 'https://images.unsplash.com/photo-1707448829764-9474458021ed?w=400&auto=format&fit=crop&q=80' }
      ]
    },
    {
      name: 'Dum Biryani',
      emoji: '🍚',
      items: [
        { name: 'Veg Biryani', priceText: '$14.99 / $29.99', basePrice: 14.99, imageUrl: 'https://images.unsplash.com/photo-1752673508949-f4aeeaef75f0?w=400&auto=format&fit=crop&q=80' },
        { name: 'Gongura Veg Biryani', priceText: '$15.99 / $31.99', basePrice: 15.99, imageUrl: 'https://images.unsplash.com/photo-1756821753095-64134f5c0c5c?w=400&auto=format&fit=crop&q=80' },
        { name: 'Ulavacharu Biryani', priceText: '$16.99 / $33.99', basePrice: 16.99, imageUrl: 'https://images.unsplash.com/photo-1707448829764-9474458021ed?w=400&auto=format&fit=crop&q=80' },
        { name: 'Chicken Dum Biryani', priceText: '$15.99 / $29.99', basePrice: 15.99, imageUrl: 'https://images.unsplash.com/photo-1772469597765-ff29d5616fb7?w=400&auto=format&fit=crop&q=80' },
        { name: 'Gongura Chicken Dum', priceText: '$16.99 / $31.99', basePrice: 16.99, imageUrl: 'https://images.unsplash.com/photo-1775039983802-b3eb3f68cd2c?w=400&auto=format&fit=crop&q=80' },
        { name: 'Ulavacharu Chicken Dum', priceText: '$16.99 / $33.99', basePrice: 16.99, imageUrl: 'https://images.unsplash.com/photo-1742599361539-f096753d1100?w=400&auto=format&fit=crop&q=80' },
        { name: 'Avakai Dum', priceText: '$16.99 / $33.99', basePrice: 16.99, imageUrl: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400&auto=format&fit=crop&q=80' },
        { name: 'Goat Dum', priceText: '$17.99 / $33.99', basePrice: 17.99, imageUrl: 'https://images.unsplash.com/photo-1606843046080-45bf7a23c39f?w=400&auto=format&fit=crop&q=80' },
        { name: 'Gongura Goat Dum', priceText: '$18.99 / $39.99', basePrice: 18.99, imageUrl: 'https://images.unsplash.com/photo-1654722487269-29469154bf82?w=400&auto=format&fit=crop&q=80' }
      ]
    },
    {
      name: 'Non Veg Gravies',
      emoji: '🍗',
      items: [
        { name: 'Egg Masala', priceText: '$12.99', basePrice: 12.99, imageUrl: 'https://images.unsplash.com/photo-1764315197254-94385571df22?w=400&auto=format&fit=crop&q=80' },
        { name: 'Egg Burji Dhaba Style', priceText: '$12.99', basePrice: 12.99, imageUrl: 'https://images.unsplash.com/photo-1707425197254-266fec098cae?w=400&auto=format&fit=crop&q=80' },
        { name: 'Butter Chicken', priceText: '$13.99', basePrice: 13.99, imageUrl: 'https://images.unsplash.com/photo-1742599361498-79824d24e355?w=400&auto=format&fit=crop&q=80' },
        { name: 'Chicken Tikka Masala', priceText: '$13.99', basePrice: 13.99, imageUrl: 'https://images.unsplash.com/photo-1742599361574-6fb156181466?w=400&auto=format&fit=crop&q=80' },
        { name: 'Chowrasta Special Chicken', priceText: '$13.99', basePrice: 13.99, imageUrl: 'https://images.unsplash.com/photo-1764304733301-3a9f335f0c67?w=400&auto=format&fit=crop&q=80' },
        { name: 'Andhra Chicken Curry', priceText: '$13.99', basePrice: 13.99, imageUrl: 'https://images.unsplash.com/photo-1742599361539-f096753d1100?w=400&auto=format&fit=crop&q=80' },
        { name: 'Dhaba Style Chicken', priceText: '$13.99', basePrice: 13.99, imageUrl: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400&auto=format&fit=crop&q=80' },
        { name: 'Malai Methi Chicken', priceText: '$13.99', basePrice: 13.99, imageUrl: 'https://images.unsplash.com/photo-1772730065344-4cf131b39951?w=400&auto=format&fit=crop&q=80' },
        { name: 'Chicken Vindaloo', priceText: '$13.99', basePrice: 13.99, imageUrl: 'https://images.unsplash.com/photo-1707448829764-9474458021ed?w=400&auto=format&fit=crop&q=80' },
        { name: 'Chettinad Chicken Curry', priceText: '$13.99', basePrice: 13.99, imageUrl: 'https://images.unsplash.com/photo-1757715376287-90f24dac4593?w=400&auto=format&fit=crop&q=80' },
        { name: 'Palak Chicken Curry', priceText: '$13.99', basePrice: 13.99, imageUrl: 'https://images.unsplash.com/photo-1767114915936-745dd372f1d8?w=400&auto=format&fit=crop&q=80' },
        { name: 'Kadai Chicken', priceText: '$13.99', basePrice: 13.99, imageUrl: 'https://images.unsplash.com/photo-1775039983802-b3eb3f68cd2c?w=400&auto=format&fit=crop&q=80' },
        { name: 'Mughlai Chicken Curry', priceText: '$14.99', basePrice: 14.99, imageUrl: 'https://images.unsplash.com/photo-1654722487269-29469154bf82?w=400&auto=format&fit=crop&q=80' },
        { name: 'Gongura Chicken Curry', priceText: '$14.99', basePrice: 14.99, imageUrl: 'https://images.unsplash.com/photo-1771074168436-8692a866cdb1?w=400&auto=format&fit=crop&q=80' },
        { name: 'Kadhai Chicken', priceText: '$14.99', basePrice: 14.99, imageUrl: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&auto=format&fit=crop&q=80' },
        { name: 'Achari Chicken', priceText: '$14.99', basePrice: 14.99, imageUrl: 'https://images.unsplash.com/photo-1723476662512-6abc972f1167?w=400&auto=format&fit=crop&q=80' },
        { name: 'Chicken Kheema Curry', priceText: '$14.99', basePrice: 14.99, imageUrl: 'https://images.unsplash.com/photo-1772469597765-ff29d5616fb7?w=400&auto=format&fit=crop&q=80' },
        { name: 'Chowrasta Special Goat', priceText: '$15.99', basePrice: 15.99, imageUrl: 'https://images.unsplash.com/photo-1606843046080-45bf7a23c39f?w=400&auto=format&fit=crop&q=80' },
        { name: 'Andhra Goat', priceText: '$15.99', basePrice: 15.99, imageUrl: 'https://images.unsplash.com/photo-1756821753095-64134f5c0c5c?w=400&auto=format&fit=crop&q=80' },
        { name: 'Dhaba Style Goat', priceText: '$15.99', basePrice: 15.99, imageUrl: 'https://images.unsplash.com/photo-1613744033489-5fd69e431d4a?w=400&auto=format&fit=crop&q=80' },
        { name: 'Goat Vindaloo', priceText: '$15.99', basePrice: 15.99, imageUrl: 'https://images.unsplash.com/photo-1662174485500-6d32a13c060e?w=400&auto=format&fit=crop&q=80' },
        { name: 'Chettinad Goat Curry', priceText: '$15.99', basePrice: 15.99, imageUrl: 'https://images.unsplash.com/photo-1756821753226-c0fc88056cf7?w=400&auto=format&fit=crop&q=80' },
        { name: 'Palak Goat Curry', priceText: '$15.99', basePrice: 15.99, imageUrl: 'https://images.unsplash.com/photo-1589647363585-f4a7d3877b10?w=400&auto=format&fit=crop&q=80' }
      ]
    },
    {
      name: 'Rice Specials',
      emoji: '🍛',
      items: [
        { name: 'Jeera Rice', priceText: '$11.99', basePrice: 11.99, imageUrl: 'https://images.unsplash.com/photo-1756821753095-64134f5c0c5c?w=400&auto=format&fit=crop&q=80' },
        { name: 'Curd Rice', priceText: '$11.99', basePrice: 11.99, imageUrl: 'https://images.unsplash.com/photo-1741376509360-3b7877b796d5?w=400&auto=format&fit=crop&q=80' },
        { name: 'Sambar Rice', priceText: '$11.99', basePrice: 11.99, imageUrl: 'https://images.unsplash.com/photo-1707448829764-9474458021ed?w=400&auto=format&fit=crop&q=80' },
        { name: 'Pulav Rice', priceText: '$10.99', basePrice: 10.99, imageUrl: 'https://images.unsplash.com/photo-1775039983802-b3eb3f68cd2c?w=400&auto=format&fit=crop&q=80' }
      ]
    },
    {
      name: 'Hot Beverages',
      emoji: '☕',
      items: [
        { name: 'Irani Chai Large', priceText: '$2.99', basePrice: 2.99, imageUrl: 'https://images.unsplash.com/photo-1579005162638-11c872e1586e?w=400&auto=format&fit=crop&q=80' },
        { name: 'Irani Chai Small', priceText: '$1.50', basePrice: 1.50, imageUrl: 'https://images.unsplash.com/photo-1770162151467-cd1465c79aed?w=400&auto=format&fit=crop&q=80' },
        { name: 'Masala Chai', priceText: '$2.00', basePrice: 2.00, imageUrl: 'https://images.unsplash.com/photo-1579005162077-541af2cae3e4?w=400&auto=format&fit=crop&q=80' }
      ]
    },
    {
      name: 'Cold Beverages',
      emoji: '🧊',
      items: [
        { name: 'Mango Lassi', priceText: '$5.99', basePrice: 5.99, imageUrl: 'https://images.unsplash.com/photo-1764403714198-f10e8e4039d0?w=400&auto=format&fit=crop&q=80' },
        { name: 'Milk Shakes (Choco/Strawberry Mix)', priceText: '$6.99', basePrice: 6.99, imageUrl: 'https://images.unsplash.com/photo-1761637592257-3c5911ae5a3a?w=400&auto=format&fit=crop&q=80' },
        { name: 'Fresh Fruit Juice (Orange/Pineapple/Muskmelon)', priceText: '$6.99', basePrice: 6.99, imageUrl: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400&auto=format&fit=crop&q=80' },
        { name: 'Oreo Shake', priceText: '$7.99', basePrice: 7.99, imageUrl: 'https://images.unsplash.com/photo-1638176066390-d1a2b56cc99c?w=400&auto=format&fit=crop&q=80' },
        { name: 'Chocolate Shake', priceText: '$7.99', basePrice: 7.99, imageUrl: 'https://images.unsplash.com/photo-1726039468346-2f3e0f1f5b52?w=400&auto=format&fit=crop&q=80' },
        { name: 'Sugar Cane Juice', priceText: '$7.99', basePrice: 7.99, imageUrl: 'https://images.unsplash.com/photo-1596458578892-c2d150d36e75?w=400&auto=format&fit=crop&q=80' }
      ]
    }
  ];

  selectedCategory: MenuCategory = null;
  pendingMap: { [key: string]: number } = {};
  cartMap: { [key: string]: number } = {};
  cartMetaMap: { [key: string]: CartItemMeta } = {};
  cartCount = 0;
  total = 0;

  searchQuery = '';
  outOfStockItems: Set<string> = new Set();

  get searchResults(): Array<{ item: MenuItem; category: MenuCategory; itemIndex: number }> {
    const q = this.searchQuery.trim().toLowerCase();
    if (!q) { return []; }
    const results: Array<{ item: MenuItem; category: MenuCategory; itemIndex: number }> = [];
    this.categories.forEach(cat => {
      cat.items.forEach((item, idx) => {
        if (item.name.toLowerCase().includes(q)) {
          results.push({ item, category: cat, itemIndex: idx });
        }
      });
    });
    return results;
  }

  constructor(private router: Router, private cartService: CartService, private http: HttpClient) {}

  ngOnInit() {
    if (sessionStorage.getItem('userData') == null) {
      this.router.navigate(['login']);
      return;
    }

    this.deduplicateCategoryItems();

    const storedCart = sessionStorage.getItem('fdCartMap');
    if (storedCart) {
      try {
        this.cartMap = JSON.parse(storedCart);
      } catch {
        this.cartMap = {};
      }
    }

    const storedTotal = sessionStorage.getItem('total');
    this.total = storedTotal ? parseFloat(storedTotal) || 0 : 0;

    const storedMeta = sessionStorage.getItem('fdCartMetaMap');
    if (storedMeta) {
      try {
        this.cartMetaMap = JSON.parse(storedMeta);
      } catch {
        this.cartMetaMap = {};
      }
    }

    this.refreshCartCount();
    this.loadOutOfStockItems();

    // Default to first category
    if (this.categories.length > 0) {
      this.selectedCategory = this.categories[0];
    }
  }

  private loadOutOfStockItems(): void {
    this.http.get<string[]>(`${environment.apiUrl}/stock/out-of-stock`).subscribe(
      list => { this.outOfStockItems = new Set(list); },
      () => { /* ignore errors — default all in stock */ }
    );
  }

  isOutOfStock(itemName: string): boolean {
    return this.outOfStockItems.has(itemName);
  }

  private deduplicateCategoryItems(): void {
    this.categories = this.categories.map((category) => {
      const seen = new Set<string>();
      const uniqueItems = category.items.filter((item) => {
        const key = item.name.trim().toLowerCase();
        if (seen.has(key)) {
          return false;
        }
        seen.add(key);
        return true;
      });
      return {
        ...category,
        items: uniqueItems
      };
    });
  }

  selectCategory(category: MenuCategory): void {
    this.selectedCategory = category;
  }

  backToCategories(): void {
    this.selectedCategory = null;
  }

  increaseItem(item: MenuItem, itemIndex: number): void {
    const key = this.getItemKey(item, itemIndex);
    this.pendingMap[key] = (this.pendingMap[key] || 0) + 1;
  }

  decreaseItem(item: MenuItem, itemIndex: number): void {
    const key = this.getItemKey(item, itemIndex);
    const current = this.pendingMap[key] || 0;
    if (current <= 0) {
      return;
    }
    const next = current - 1;
    if (next === 0) {
      delete this.pendingMap[key];
    } else {
      this.pendingMap[key] = next;
    }
  }

  getItemQuantity(item: MenuItem, itemIndex: number): number {
    const key = this.getItemKey(item, itemIndex);
    return this.pendingMap[key] || 0;
  }

  addToCart(item: MenuItem, itemIndex: number): void {
    const key = this.getItemKey(item, itemIndex);
    const qtyToAdd = this.pendingMap[key] || 0;
    if (qtyToAdd <= 0) {
      return;
    }

    this.cartMap[key] = (this.cartMap[key] || 0) + qtyToAdd;
    this.cartMetaMap[key] = { name: item.name, basePrice: item.basePrice };
    this.total = +(this.total + (item.basePrice * qtyToAdd)).toFixed(2);
    delete this.pendingMap[key];
    this.persistCart();
    this.refreshCartCount();
  }

  clearLocal(): void {
    this.cartService.clearCart();
    sessionStorage.removeItem('fdCartMap');
    sessionStorage.removeItem('fdCartMetaMap');
    sessionStorage.clear();
  }

  private refreshCartCount(): void {
    this.cartCount = Object.keys(this.cartMap).reduce((sum, key) => sum + (this.cartMap[key] || 0), 0);
    this.cartService.updateCount(this.cartCount);
  }

  private persistCart(): void {
    sessionStorage.setItem('fdCartMap', JSON.stringify(this.cartMap));
    sessionStorage.setItem('fdCartMetaMap', JSON.stringify(this.cartMetaMap));
    sessionStorage.setItem('total', this.total.toFixed(2));
  }

  private getItemKey(item: MenuItem, itemIndex: number, categoryOverride?: MenuCategory): string {
    const categoryName = categoryOverride
      ? categoryOverride.name
      : (this.selectedCategory ? this.selectedCategory.name : 'uncategorized');
    return `${categoryName}::${itemIndex}::${item.name}`;
  }

  getSearchItemKey(item: MenuItem, itemIndex: number, category: MenuCategory): string {
    return this.getItemKey(item, itemIndex, category);
  }

  getSearchItemQuantity(item: MenuItem, itemIndex: number, category: MenuCategory): number {
    return this.pendingMap[this.getItemKey(item, itemIndex, category)] || 0;
  }

  increaseSearchItem(item: MenuItem, itemIndex: number, category: MenuCategory): void {
    const key = this.getItemKey(item, itemIndex, category);
    this.pendingMap[key] = (this.pendingMap[key] || 0) + 1;
  }

  decreaseSearchItem(item: MenuItem, itemIndex: number, category: MenuCategory): void {
    const key = this.getItemKey(item, itemIndex, category);
    const current = this.pendingMap[key] || 0;
    if (current <= 0) { return; }
    if (current - 1 === 0) { delete this.pendingMap[key]; } else { this.pendingMap[key] = current - 1; }
  }

  addSearchItemToCart(item: MenuItem, itemIndex: number, category: MenuCategory): void {
    const key = this.getItemKey(item, itemIndex, category);
    const qty = this.pendingMap[key] || 0;
    if (qty <= 0) { return; }
    this.cartMap[key] = (this.cartMap[key] || 0) + qty;
    this.cartMetaMap[key] = { name: item.name, basePrice: item.basePrice };
    this.total = +(this.total + item.basePrice * qty).toFixed(2);
    delete this.pendingMap[key];
    this.persistCart();
    this.refreshCartCount();
  }

  getIngredients(itemName: string): string {
    return this.ingredientsMap[itemName] || 'Fresh ingredients, spices, and chef\'s secret blend';
  }

  openPopup(item: MenuItem, itemIndex: number, category: MenuCategory, event: Event): void {
    event.stopPropagation();
    this.popup = { item, itemIndex, category };
    this.popupQty = 1;
    const key = this.getItemKey(item, itemIndex, category);
    this.popupSpecialInstructions = (this.cartMetaMap[key] && this.cartMetaMap[key].specialInstructions) || '';
    document.body.style.overflow = 'hidden';
  }

  closePopup(): void {
    this.popup = null;
    this.popupSpecialInstructions = '';
    document.body.style.overflow = '';
  }

  addPopupToCart(): void {
    if (!this.popup) { return; }
    const { item, itemIndex, category } = this.popup;
    const key = this.getItemKey(item, itemIndex, category);
    const existing = this.cartMetaMap[key];
    const note = this.popupSpecialInstructions.trim();
    let specialInstructions = existing ? existing.specialInstructions : undefined;
    if (note) {
      specialInstructions = existing && existing.specialInstructions && existing.specialInstructions !== note
        ? `${existing.specialInstructions}; ${note}`
        : note;
    }

    this.cartMap[key] = (this.cartMap[key] || 0) + this.popupQty;
    this.cartMetaMap[key] = {
      name: item.name,
      basePrice: item.basePrice,
      specialInstructions
    };
    this.total = +(this.total + item.basePrice * this.popupQty).toFixed(2);
    this.persistCart();
    this.refreshCartCount();
    this.closePopup();
  }

  isItemOutOfStock(item: MenuItem, itemIndex: number, category: MenuCategory): boolean {
    return this.outOfStockItems.has(this.getItemKey(item, itemIndex, category));
  }

  getCategoryColor(categoryName?: string): string {
    return (categoryName && this.categoryColors[categoryName])
      ? this.categoryColors[categoryName]
      : 'linear-gradient(135deg, #e65c00, #f9d423)';
  }

  onItemImageError(event: Event, item: MenuItem): void {
    const element = event.target as HTMLImageElement | null;
    if (element) {
      element.style.display = 'none';
      item.imageUrl = null;
    }
  }
}

/* Keep legacy exports to avoid breaking other components that import from this file. */
export interface menu {
  id: string;
  item: string;
  price: number;
  quantity: number;
  url: string;
  formID: string;
  cartID: string;
}

export interface cart {
  quantity1: number;
  quantity2: number;
  quantity3: number;
}

export class Quantity {
  quantity: number;
}
