import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { CartService } from "../cart.service";

interface MenuItem {
  name: string;
  priceText: string;
  basePrice: number;
  imageUrl?: string;
}

interface MenuCategory {
  name: string;
  emoji: string;
  items: MenuItem[];
}

interface CartItemMeta {
  name: string;
  basePrice: number;
}

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {
  private readonly fallbackImageUrl = 'https://source.unsplash.com/640x420/?indian+food,meal';
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
        { name: 'Idly (3 pcs)',            priceText: '$7.99',  basePrice: 7.99,  imageUrl: 'https://source.unsplash.com/640x420/?idli,indian+food' },
        { name: 'Vada (2 pcs)',            priceText: '$7.99',  basePrice: 7.99,  imageUrl: 'https://source.unsplash.com/640x420/?medu+vada,south+indian' },
        { name: 'Upma',                    priceText: '$7.99',  basePrice: 7.99,  imageUrl: 'https://source.unsplash.com/640x420/?upma,semolina' },
        { name: 'Pongal',                  priceText: '$7.99',  basePrice: 7.99,  imageUrl: 'https://source.unsplash.com/640x420/?pongal,indian+rice' },
        { name: 'Ghee Karam Idly (3 pcs)', priceText: '$8.99',  basePrice: 8.99,  imageUrl: 'https://source.unsplash.com/640x420/?idli,south+indian+food' },
        { name: 'Sambar Idly (2 pcs)',     priceText: '$8.99',  basePrice: 8.99,  imageUrl: 'https://source.unsplash.com/640x420/?idli+sambar' },
        { name: 'Sambar Vada (2 pcs)',     priceText: '$8.99',  basePrice: 8.99,  imageUrl: 'https://source.unsplash.com/640x420/?vada+sambar,south+indian' },
        { name: 'Mysore Bonda (3 pcs)',    priceText: '$8.99',  basePrice: 8.99,  imageUrl: 'https://source.unsplash.com/640x420/?bonda,fried+snack' },
        { name: 'Plain Dosa',              priceText: '$8.99',  basePrice: 8.99,  imageUrl: 'https://source.unsplash.com/640x420/?dosa,south+indian' },
        { name: 'Masala Dosa',             priceText: '$10.99', basePrice: 10.99, imageUrl: 'https://source.unsplash.com/640x420/?masala+dosa' },
        { name: 'Mysore Masala Dosa',      priceText: '$10.99', basePrice: 10.99, imageUrl: 'https://source.unsplash.com/640x420/?mysore+dosa,dosa' },
        { name: 'Onion Dosa',              priceText: '$10.99', basePrice: 10.99, imageUrl: 'https://source.unsplash.com/640x420/?dosa,crispy' },
        { name: 'Podi Karam Dosa',         priceText: '$10.99', basePrice: 10.99, imageUrl: 'https://source.unsplash.com/640x420/?dosa,spicy' },
        { name: 'Guntur Karam Dosa',       priceText: '$10.99', basePrice: 10.99, imageUrl: 'https://source.unsplash.com/640x420/?dosa,andhra' },
        { name: 'Annam Cheese Dosa',       priceText: '$11.99', basePrice: 11.99, imageUrl: 'https://source.unsplash.com/640x420/?cheese+dosa' },
        { name: 'Nutella Dosa',            priceText: '$11.99', basePrice: 11.99, imageUrl: 'https://source.unsplash.com/640x420/?nutella+crepe,dosa' },
        { name: 'Paneer Dosa',             priceText: '$11.99', basePrice: 11.99, imageUrl: 'https://source.unsplash.com/640x420/?paneer+dosa' },
        { name: 'Ghee Karam Dosa',         priceText: '$11.99', basePrice: 11.99, imageUrl: 'https://source.unsplash.com/640x420/?ghee+dosa,crispy' },
        { name: 'Gongura Onion Dosa',      priceText: '$11.99', basePrice: 11.99, imageUrl: 'https://source.unsplash.com/640x420/?dosa,south+indian+food' },
        { name: 'Egg Dosa',                priceText: '$11.99', basePrice: 11.99, imageUrl: 'https://source.unsplash.com/640x420/?egg+dosa,omelette' },
        { name: 'Chicken 65 Dosa',         priceText: '$11.99', basePrice: 11.99, imageUrl: 'https://source.unsplash.com/640x420/?chicken+dosa,fried+chicken' },
        { name: 'Chicken Keema Dosa',      priceText: '$12.99', basePrice: 12.99, imageUrl: 'https://source.unsplash.com/640x420/?keema,minced+chicken' }
      ]
    },
    {
      name: 'Veg Gravies',
      emoji: '🍛',
      items: [
        { name: 'Yellow Dal Tadka',       priceText: '$11.99', basePrice: 11.99, imageUrl: 'https://source.unsplash.com/640x420/?dal+tadka,lentil+curry' },
        { name: 'Mix Vegetable Curry',    priceText: '$12.99', basePrice: 12.99, imageUrl: 'https://source.unsplash.com/640x420/?vegetable+curry,indian' },
        { name: 'Kadai Veg Curry',        priceText: '$12.99', basePrice: 12.99, imageUrl: 'https://source.unsplash.com/640x420/?kadai+curry,vegetable' },
        { name: 'Navratan Korma Veg',     priceText: '$12.99', basePrice: 12.99, imageUrl: 'https://source.unsplash.com/640x420/?korma,indian+curry' },
        { name: 'Chana Masala',           priceText: '$12.99', basePrice: 12.99, imageUrl: 'https://source.unsplash.com/640x420/?chana+masala,chickpea' },
        { name: 'Palak Chana',            priceText: '$12.99', basePrice: 12.99, imageUrl: 'https://source.unsplash.com/640x420/?palak,spinach+curry' },
        { name: 'Aloo Gobi',              priceText: '$12.99', basePrice: 12.99, imageUrl: 'https://source.unsplash.com/640x420/?aloo+gobi,potato+cauliflower' },
        { name: 'Gutti Vankaya Curry',    priceText: '$12.99', basePrice: 12.99, imageUrl: 'https://source.unsplash.com/640x420/?eggplant+curry,brinjal' },
        { name: 'Bhindi Masala',          priceText: '$13.99', basePrice: 13.99, imageUrl: 'https://source.unsplash.com/640x420/?okra+curry,bhindi' },
        { name: 'Malai Kofta',            priceText: '$13.99', basePrice: 13.99, imageUrl: 'https://source.unsplash.com/640x420/?malai+kofta,cream+curry' },
        { name: 'Kaju Matar',             priceText: '$13.99', basePrice: 13.99, imageUrl: 'https://source.unsplash.com/640x420/?cashew+curry,peas' },
        { name: 'Navratan Korma',         priceText: '$13.99', basePrice: 13.99, imageUrl: 'https://source.unsplash.com/640x420/?navratan+korma,mixed+curry' },
        { name: 'Mushroom Masala',        priceText: '$14.99', basePrice: 14.99, imageUrl: 'https://source.unsplash.com/640x420/?mushroom+curry,mushroom' },
        { name: 'Kaju Masala',            priceText: '$14.99', basePrice: 14.99, imageUrl: 'https://source.unsplash.com/640x420/?cashew+masala,rich+curry' },
        { name: 'Kaju Capsicum Masala',   priceText: '$14.99', basePrice: 14.99, imageUrl: 'https://source.unsplash.com/640x420/?capsicum+curry,pepper' },
        { name: 'Achari Handi Masala',    priceText: '$14.99', basePrice: 14.99, imageUrl: 'https://source.unsplash.com/640x420/?achari,indian+curry' },
        { name: 'Veg Kheema Masala',      priceText: '$14.99', basePrice: 14.99, imageUrl: 'https://source.unsplash.com/640x420/?keema+masala,minced' },
        { name: 'Paneer Butter Masala',   priceText: '$14.99', basePrice: 14.99, imageUrl: 'https://source.unsplash.com/640x420/?paneer+butter+masala' },
        { name: 'Paneer Tikka Masala',    priceText: '$14.99', basePrice: 14.99, imageUrl: 'https://source.unsplash.com/640x420/?paneer+tikka+masala' },
        { name: 'Palak Paneer',           priceText: '$14.99', basePrice: 14.99, imageUrl: 'https://source.unsplash.com/640x420/?palak+paneer,spinach' },
        { name: 'Kadai Paneer',           priceText: '$14.99', basePrice: 14.99, imageUrl: 'https://source.unsplash.com/640x420/?kadai+paneer,cottage+cheese' },
        { name: 'Methi Paneer',           priceText: '$14.99', basePrice: 14.99, imageUrl: 'https://source.unsplash.com/640x420/?methi+paneer,fenugreek' }
      ]
    },
    {
      name: 'Mandi Specials',
      emoji: '🍗',
      items: [
        { name: 'Paneer Juicy Mandi',       priceText: '$23.99 / $41.99 / $61.99', basePrice: 23.99, imageUrl: 'https://source.unsplash.com/640x420/?mandi,arabian+rice' },
        { name: 'Veg Mandi',                priceText: '$23.99 / $41.99',          basePrice: 23.99, imageUrl: 'https://source.unsplash.com/640x420/?mandi,rice+platter' },
        { name: 'Egg Mandi',                priceText: '$21.99 / $41.99',          basePrice: 21.99, imageUrl: 'https://source.unsplash.com/640x420/?mandi+rice,egg' },
        { name: 'Chicken Fry Piece Mandi',  priceText: '$21.99 / $41.99',          basePrice: 21.99, imageUrl: 'https://source.unsplash.com/640x420/?chicken+mandi,fried+chicken' },
        { name: 'Juicy Chicken Mandi',      priceText: '$23.99 / $45.99 / $67.99', basePrice: 23.99, imageUrl: 'https://source.unsplash.com/640x420/?mandi+chicken,roast+chicken' },
        { name: 'Spicy Chicken Mandi',      priceText: '$23.99 / $45.99 / $67.99', basePrice: 23.99, imageUrl: 'https://source.unsplash.com/640x420/?spicy+chicken,mandi' },
        { name: 'Afghani Chicken Mandi',    priceText: '$23.99 / $45.99 / $67.99', basePrice: 23.99, imageUrl: 'https://source.unsplash.com/640x420/?afghani+chicken,kebab' },
        { name: 'Ghee Roast Mutton Mandi',  priceText: '$24.99 / $47.99',          basePrice: 24.99, imageUrl: 'https://source.unsplash.com/640x420/?mutton+roast,ghee' },
        { name: 'Afghani Mutton Mandi',     priceText: '$24.99 / $47.99',          basePrice: 24.99, imageUrl: 'https://source.unsplash.com/640x420/?mutton+mandi,lamb' },
        { name: 'Spicy Shrimp Mandi',       priceText: '$24.99 / $47.99',          basePrice: 24.99, imageUrl: 'https://source.unsplash.com/640x420/?shrimp+curry,prawn' }
      ]
    },
    {
      name: 'Dum Biryani',
      emoji: '🍚',
      items: [
        { name: 'Veg Biryani',           priceText: '$14.99 / $29.99', basePrice: 14.99, imageUrl: 'https://source.unsplash.com/640x420/?veg+biryani,vegetable+rice' },
        { name: 'Gongura Veg Biryani',   priceText: '$15.99 / $31.99', basePrice: 15.99, imageUrl: 'https://source.unsplash.com/640x420/?biryani,spiced+rice' },
        { name: 'Ulavacharu Biryani',    priceText: '$16.99 / $33.99', basePrice: 16.99, imageUrl: 'https://source.unsplash.com/640x420/?biryani,andhra' },
        { name: 'Chicken Dum Biryani',   priceText: '$15.99 / $29.99', basePrice: 15.99, imageUrl: 'https://source.unsplash.com/640x420/?chicken+biryani' },
        { name: 'Gongura Chicken Dum',   priceText: '$16.99 / $31.99', basePrice: 16.99, imageUrl: 'https://source.unsplash.com/640x420/?chicken+biryani,spicy' },
        { name: 'Ulavacharu Chicken Dum',priceText: '$16.99 / $33.99', basePrice: 16.99, imageUrl: 'https://source.unsplash.com/640x420/?dum+biryani,chicken' },
        { name: 'Avakai Dum',            priceText: '$16.99 / $33.99', basePrice: 16.99, imageUrl: 'https://source.unsplash.com/640x420/?biryani,pickle+rice' },
        { name: 'Goat Dum',              priceText: '$17.99 / $33.99', basePrice: 17.99, imageUrl: 'https://source.unsplash.com/640x420/?mutton+biryani,goat' },
        { name: 'Gongura Goat Dum',      priceText: '$18.99 / $39.99', basePrice: 18.99, imageUrl: 'https://source.unsplash.com/640x420/?mutton+biryani,hyderabadi' }
      ]
    },
    {
      name: 'Non Veg Gravies',
      emoji: '🍗',
      items: [
        { name: 'Egg Masala',              priceText: '$12.99', basePrice: 12.99, imageUrl: 'https://source.unsplash.com/640x420/?egg+curry,egg+masala' },
        { name: 'Egg Burji Dhaba Style',   priceText: '$12.99', basePrice: 12.99, imageUrl: 'https://source.unsplash.com/640x420/?scrambled+egg,dhaba' },
        { name: 'Butter Chicken',          priceText: '$13.99', basePrice: 13.99, imageUrl: 'https://source.unsplash.com/640x420/?butter+chicken,murgh+makhani' },
        { name: 'Chicken Tikka Masala',    priceText: '$13.99', basePrice: 13.99, imageUrl: 'https://source.unsplash.com/640x420/?chicken+tikka+masala' },
        { name: 'Chowrasta Special Chicken',priceText: '$13.99', basePrice: 13.99, imageUrl: 'https://source.unsplash.com/640x420/?chicken+curry,indian' },
        { name: 'Andhra Chicken Curry',    priceText: '$13.99', basePrice: 13.99, imageUrl: 'https://source.unsplash.com/640x420/?andhra+chicken,spicy+curry' },
        { name: 'Dhaba Style Chicken',     priceText: '$13.99', basePrice: 13.99, imageUrl: 'https://source.unsplash.com/640x420/?dhaba+chicken,roadside' },
        { name: 'Malai Methi Chicken',     priceText: '$13.99', basePrice: 13.99, imageUrl: 'https://source.unsplash.com/640x420/?cream+chicken,methi' },
        { name: 'Chicken Vindaloo',        priceText: '$13.99', basePrice: 13.99, imageUrl: 'https://source.unsplash.com/640x420/?vindaloo,goan+chicken' },
        { name: 'Chettinad Chicken Curry', priceText: '$13.99', basePrice: 13.99, imageUrl: 'https://source.unsplash.com/640x420/?chettinad+chicken,black+pepper' },
        { name: 'Palak Chicken Curry',     priceText: '$13.99', basePrice: 13.99, imageUrl: 'https://source.unsplash.com/640x420/?palak+chicken,spinach+chicken' },
        { name: 'Kadai Chicken',           priceText: '$13.99', basePrice: 13.99, imageUrl: 'https://source.unsplash.com/640x420/?kadai+chicken,wok+chicken' },
        { name: 'Mughlai Chicken Curry',   priceText: '$14.99', basePrice: 14.99, imageUrl: 'https://source.unsplash.com/640x420/?mughlai+chicken,rich+curry' },
        { name: 'Gongura Chicken Curry',   priceText: '$14.99', basePrice: 14.99, imageUrl: 'https://source.unsplash.com/640x420/?chicken+curry,tangy' },
        { name: 'Kadhai Chicken',          priceText: '$14.99', basePrice: 14.99, imageUrl: 'https://source.unsplash.com/640x420/?chicken+masala,indian' },
        { name: 'Achari Chicken',          priceText: '$14.99', basePrice: 14.99, imageUrl: 'https://source.unsplash.com/640x420/?pickle+chicken,achari' },
        { name: 'Chicken Kheema Curry',    priceText: '$14.99', basePrice: 14.99, imageUrl: 'https://source.unsplash.com/640x420/?keema+curry,minced+meat' },
        { name: 'Chowrasta Special Goat',  priceText: '$15.99', basePrice: 15.99, imageUrl: 'https://source.unsplash.com/640x420/?mutton+curry,goat' },
        { name: 'Andhra Goat',             priceText: '$15.99', basePrice: 15.99, imageUrl: 'https://source.unsplash.com/640x420/?andhra+mutton,goat+curry' },
        { name: 'Dhaba Style Goat',        priceText: '$15.99', basePrice: 15.99, imageUrl: 'https://source.unsplash.com/640x420/?mutton,dhaba+style' },
        { name: 'Goat Vindaloo',           priceText: '$15.99', basePrice: 15.99, imageUrl: 'https://source.unsplash.com/640x420/?vindaloo,goat+curry' },
        { name: 'Chettinad Goat Curry',    priceText: '$15.99', basePrice: 15.99, imageUrl: 'https://source.unsplash.com/640x420/?chettinad,goat' },
        { name: 'Palak Goat Curry',        priceText: '$15.99', basePrice: 15.99, imageUrl: 'https://source.unsplash.com/640x420/?spinach+mutton,palak' }
      ]
    },
    {
      name: 'Rice Specials',
      emoji: '🍛',
      items: [
        { name: 'Jeera Rice',  priceText: '$11.99', basePrice: 11.99, imageUrl: 'https://source.unsplash.com/640x420/?jeera+rice,cumin+rice' },
        { name: 'Curd Rice',   priceText: '$11.99', basePrice: 11.99, imageUrl: 'https://source.unsplash.com/640x420/?curd+rice,yogurt+rice' },
        { name: 'Sambar Rice', priceText: '$11.99', basePrice: 11.99, imageUrl: 'https://source.unsplash.com/640x420/?sambar+rice,south+indian' },
        { name: 'Pulav Rice',  priceText: '$10.99', basePrice: 10.99, imageUrl: 'https://source.unsplash.com/640x420/?pulao,pilaf+rice' }
      ]
    },
    {
      name: 'Hot Beverages',
      emoji: '☕',
      items: [
        { name: 'Irani Chai Large', priceText: '$2.99', basePrice: 2.99, imageUrl: 'https://source.unsplash.com/640x420/?irani+chai,hyderabadi+tea' },
        { name: 'Irani Chai Small', priceText: '$1.50', basePrice: 1.50, imageUrl: 'https://source.unsplash.com/640x420/?chai,tea+glass' },
        { name: 'Masala Chai',      priceText: '$2.00', basePrice: 2.00, imageUrl: 'https://source.unsplash.com/640x420/?masala+chai,spiced+tea' }
      ]
    },
    {
      name: 'Cold Beverages',
      emoji: '🧊',
      items: [
        { name: 'Mango Lassi',                                    priceText: '$5.99', basePrice: 5.99, imageUrl: 'https://source.unsplash.com/640x420/?mango+lassi,mango+drink' },
        { name: 'Milk Shakes (Choco/Strawberry Mix)',             priceText: '$6.99', basePrice: 6.99, imageUrl: 'https://source.unsplash.com/640x420/?milkshake,chocolate+shake' },
        { name: 'Fresh Fruit Juice (Orange/Pineapple/Muskmelon)', priceText: '$6.99', basePrice: 6.99, imageUrl: 'https://source.unsplash.com/640x420/?fresh+juice,orange+juice' },
        { name: 'Oreo Shake',                                     priceText: '$7.99', basePrice: 7.99, imageUrl: 'https://source.unsplash.com/640x420/?oreo+shake,cookies+cream' },
        { name: 'Chocolate Shake',                                priceText: '$7.99', basePrice: 7.99, imageUrl: 'https://source.unsplash.com/640x420/?chocolate+milkshake' },
        { name: 'Sugar Cane Juice',                               priceText: '$7.99', basePrice: 7.99, imageUrl: 'https://source.unsplash.com/640x420/?sugarcane+juice,fresh+juice' }
      ]
    }
  ];

  selectedCategory: MenuCategory = null;
  pendingMap: { [key: string]: number } = {};
  cartMap: { [key: string]: number } = {};
  cartMetaMap: { [key: string]: CartItemMeta } = {};
  cartCount = 0;
  total = 0;

  searchTerm = '';
  priceFilter: 'all' | 'under10' | '10to15' | 'above15' = 'all';
  dietFilter: 'all' | 'veg' | 'nonveg' = 'all';
  sortOrder: 'default' | 'asc' | 'desc' = 'default';

  private readonly vegCategories = ['Appetizers Veg', 'Breakfast Combos', 'Snack Box',
    'Chaat Section', 'Tiffins/Dosas', 'Veg Gravies', 'Rice Specials',
    'Hot Beverages', 'Cold Beverages'];
  private readonly nonVegCategories = ['Appetizers Non Veg', 'Mandi Specials',
    'Dum Biryani', 'Non Veg Gravies'];

  get isSearchActive(): boolean {
    return this.searchTerm.trim().length > 0 ||
           this.priceFilter !== 'all' ||
           this.dietFilter !== 'all';
  }

  get filteredResults(): Array<{ item: MenuItem; categoryName: string; itemIndex: number }> {
    const term = this.searchTerm.trim().toLowerCase();
    const results: Array<{ item: MenuItem; categoryName: string; itemIndex: number }> = [];

    for (const category of this.categories) {
      if (this.dietFilter === 'veg' && !this.vegCategories.includes(category.name)) continue;
      if (this.dietFilter === 'nonveg' && !this.nonVegCategories.includes(category.name)) continue;

      category.items.forEach((item, idx) => {
        if (term && !item.name.toLowerCase().includes(term)) return;
        if (this.priceFilter === 'under10' && item.basePrice >= 10) return;
        if (this.priceFilter === '10to15' && (item.basePrice < 10 || item.basePrice > 15)) return;
        if (this.priceFilter === 'above15' && item.basePrice <= 15) return;
        results.push({ item, categoryName: category.name, itemIndex: idx });
      });
    }

    if (this.sortOrder === 'asc')  results.sort((a, b) => a.item.basePrice - b.item.basePrice);
    if (this.sortOrder === 'desc') results.sort((a, b) => b.item.basePrice - a.item.basePrice);
    return results;
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.priceFilter = 'all';
    this.dietFilter = 'all';
    this.sortOrder = 'default';
  }

  addToCartFromSearch(item: MenuItem, categoryName: string, itemIndex: number): void {
    const savedCategory = this.selectedCategory;
    const tempCat = this.categories.find(c => c.name === categoryName);
    this.selectedCategory = tempCat || null;
    const qty = this.getItemQuantity(item, itemIndex);
    if (qty > 0) {
      this.addToCart(item, itemIndex);
    } else {
      this.increaseItem(item, itemIndex);
      this.addToCart(item, itemIndex);
    }
    this.selectedCategory = savedCategory;
  }

  getSearchItemKey(item: MenuItem, categoryName: string, itemIndex: number): string {
    return `${categoryName}::${itemIndex}::${item.name}`;
  }

  getSearchItemQuantity(item: MenuItem, categoryName: string, itemIndex: number): number {
    return this.pendingMap[this.getSearchItemKey(item, categoryName, itemIndex)] || 0;
  }

  increaseSearchItem(item: MenuItem, categoryName: string, itemIndex: number): void {
    const key = this.getSearchItemKey(item, categoryName, itemIndex);
    this.pendingMap[key] = (this.pendingMap[key] || 0) + 1;
  }

  decreaseSearchItem(item: MenuItem, categoryName: string, itemIndex: number): void {
    const key = this.getSearchItemKey(item, categoryName, itemIndex);
    const current = this.pendingMap[key] || 0;
    if (current <= 1) { delete this.pendingMap[key]; } else { this.pendingMap[key] = current - 1; }
  }

  addSearchItemToCart(item: MenuItem, categoryName: string, itemIndex: number): void {
    const key = this.getSearchItemKey(item, categoryName, itemIndex);
    const qty = this.pendingMap[key] || 0;
    if (qty <= 0) return;
    this.cartMap[key] = (this.cartMap[key] || 0) + qty;
    this.cartMetaMap[key] = { name: item.name, basePrice: item.basePrice };
    this.total = +(this.total + item.basePrice * qty).toFixed(2);
    delete this.pendingMap[key];
    this.persistCart();
    this.refreshCartCount();
  }

  constructor(private router: Router, private cartService: CartService) {}

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

  private getItemKey(item: MenuItem, itemIndex: number): string {
    const categoryName = this.selectedCategory ? this.selectedCategory.name : 'uncategorized';
    return `${categoryName}::${itemIndex}::${item.name}`;
  }

  getItemImageUrl(item: MenuItem, categoryName?: string): string {
    if (item.imageUrl && item.imageUrl.trim().length > 0) {
      return item.imageUrl;
    }
    // Build keyword-based Unsplash Source URL as fallback for any item without a set imageUrl
    const tags = this.buildImageTags(item.name, categoryName);
    return `https://source.unsplash.com/640x420/?${encodeURIComponent(tags)}`;
  }

  onItemImageError(event: Event): void {
    const element = event.target as HTMLImageElement | null;
    if (!element) {
      return;
    }
    if (element.src === this.fallbackImageUrl) {
      return;
    }
    element.src = this.fallbackImageUrl;
  }

  private getStableLock(value: string): number {
    let hash = 0;
    for (let i = 0; i < value.length; i++) {
      hash = ((hash << 5) - hash) + value.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash) || 1;
  }

  private buildImageTags(itemName: string, categoryName?: string): string {
    const tokenize = (value: string): string[] =>
      (value || '')
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter((token) => token.length > 2);

    const allTokens = [...tokenize(itemName), ...tokenize(categoryName || '')];
    const unique: string[] = [];
    allTokens.forEach((token) => {
      if (!unique.includes(token) && unique.length < 4) {
        unique.push(token);
      }
    });

    unique.push('food');
    unique.push('dish');
    return unique.join(',');
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
  inStock: boolean;
}

export interface cart {
  quantity1: number;
  quantity2: number;
  quantity3: number;
}

export class Quantity {
  quantity: number;
}
