window.catalogData = {
  collections: [
    {
      id: 'essentials',
      name: 'Essentials',
      slug: 'essentials',
      description: 'Peças clássicas para cozinhas contemporâneas.',
      image: null
    },
    {
      id: 'signature',
      name: 'Signature',
      slug: 'signature',
      description: 'Coleção premium com maior presença visual.',
      image: null
    }
  ],
  products: [
    {
      title: 'Linho Anatoliano',
      variant: 'Branco natural · 45×70cm',
      price: 'R$ 89,00',
      promotionalPrice: 'R$ 79,00',
      badge: 'Novo',
      label: 'Pano dobrado',
      small: 'Em suporte de bancada',
      slug: 'linho-anatoliano',
      description: 'Um tecido leve e sofisticado, pensado para quem valoriza textura, durabilidade e presença em cada detalhe da cozinha.',
      highlights: ['Algodão egípcio de fibra longa', 'Acabamento à mão', 'Ideal para uso diário'],
      inStock: true,
      stock: 14,
      colors: ['Branco natural', 'Areia', 'Linho'],
      sizes: ['45×70cm', '60×90cm'],
      collectionId: 'essentials',
      gallery: ['https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80'],
      variants: [
        { id: 'linho-branco', name: 'Branco natural', color: 'Branco natural', size: '45×70cm', price: 'R$ 89,00', promotionalPrice: 'R$ 79,00', stock: 8, image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80' },
        { id: 'linho-areia', name: 'Areia', color: 'Areia', size: '45×70cm', price: 'R$ 94,00', stock: 6, image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80' }
      ]
    },
    {
      title: 'Borda Dourada',
      variant: 'Areia com detalhe dourado · 45×70cm',
      price: 'R$ 99,00',
      badge: '',
      label: 'Pano em mesa',
      small: 'Mesa decorada, iluminação quente',
      slug: 'borda-dourada',
      description: 'Uma peça de caráter, com acabamento discreto e personalidade marcante para mesas mais elegantes.',
      highlights: ['Padrão delicado', 'Tonalidade neutra', 'Excelente para presentear'],
      inStock: true,
      stock: 9,
      colors: ['Areia'],
      sizes: ['45×70cm'],
      collectionId: 'signature',
      gallery: ['https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=80'],
      variants: [
        { id: 'borda-areia', name: 'Areia', color: 'Areia', size: '45×70cm', price: 'R$ 99,00', stock: 5, image: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=80' }
      ]
    },
    {
      title: 'Listrado Clássico',
      variant: 'Branco e terracota · 45×70cm',
      price: 'R$ 95,00',
      promotionalPrice: 'R$ 85,00',
      badge: 'Mais vendido',
      label: 'Pano pendurado',
      small: 'Em suporte de alto padrão',
      slug: 'listrado-classico',
      description: 'A combinação perfeita entre tradição e modernidade, com linhas que trazem movimento à decoração.',
      highlights: ['Estampa clássica', 'Boa absorção', 'Versátil para diferentes estilos'],
      inStock: true,
      stock: 11,
      colors: ['Branco', 'Terracota'],
      sizes: ['45×70cm', '60×90cm'],
      collectionId: 'essentials',
      gallery: ['https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=800&q=80'],
      variants: [
        { id: 'listrado-branco', name: 'Branco', color: 'Branco', size: '45×70cm', price: 'R$ 95,00', promotionalPrice: 'R$ 85,00', stock: 7, image: 'https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=800&q=80' },
        { id: 'listrado-terracota', name: 'Terracota', color: 'Terracota', size: '45×70cm', price: 'R$ 97,00', stock: 4, image: 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=800&q=80' }
      ]
    },
    {
      title: 'Jacquard Ottomano',
      variant: 'Creme com padrão geométrico · 45×70cm',
      price: 'R$ 119,00',
      badge: '',
      label: 'Detalhe do tecido',
      small: 'Close na textura e acabamento',
      slug: 'jacquard-ottomano',
      description: 'Uma peça de coleção, criada para quem quer textura e presença sem perder a delicadeza do cotidiano.',
      highlights: ['Tecido jacquard', 'Design geométrico', 'Alta percepção de luxo'],
      inStock: false,
      stock: 0,
      colors: ['Creme'],
      sizes: ['45×70cm'],
      collectionId: 'signature',
      gallery: ['https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=800&q=80'],
      variants: [
        { id: 'jacquard-creme', name: 'Creme', color: 'Creme', size: '45×70cm', price: 'R$ 119,00', stock: 0, image: 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=800&q=80' }
      ]
    }
  ],
  kits: [
    {
      title: 'Cozinha Clássica',
      description: 'Três panos em tons neutros — branco natural, areia e linho — para combinar com qualquer cozinha.',
      price: 'R$ 249,00',
      tag: 'Kit · 3 peças',
      label: 'Kit empilhado',
      small: '3 panos dobrados sobre bancada'
    },
    {
      title: 'Presente Especial',
      description: 'Quatro peças selecionadas em embalagem presente com caixa e cartão personalizado.',
      price: 'R$ 329,00',
      tag: 'Kit · 4 peças + embalagem',
      label: 'Kit presenteado',
      small: 'Caixa com fita e papel de seda'
    },
    {
      title: 'Mesa de Brunch',
      description: 'Seis panos combinados — dois de cada cor — para uma mesa generosa e elegante.',
      price: 'R$ 479,00',
      tag: 'Kit · 6 peças',
      label: 'Kit mesa posta',
      small: 'Panos em mesa bem decorada'
    },
    {
      title: 'Cozinha Gourmet',
      description: 'Mix de padrões e texturas para quem enxerga os panos de prato como peça de decoração.',
      price: 'R$ 419,00',
      tag: 'Kit · 5 peças',
      label: 'Kit decorativo',
      small: 'Panos em suporte alto — cozinha aberta'
    }
  ]
};
