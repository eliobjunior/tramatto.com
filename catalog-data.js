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
      price: 'R$ 120,00',
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
      gallery: ['assets/images/produto-linho-anatoliano.jpg'],
      variants: [
        { id: 'linho-branco', name: 'Branco natural', color: 'Branco natural', size: '45×70cm', price: 'R$ 120,00', stock: 8, image: 'assets/images/produto-linho-anatoliano.jpg' },
        { id: 'linho-areia', name: 'Areia', color: 'Areia', size: '45×70cm', price: 'R$ 120,00', stock: 6, image: 'assets/images/produto-linho-anatoliano.jpg' }
      ]
    },
    {
      title: 'Borda Dourada',
      variant: 'Areia com detalhe dourado · 45×70cm',
      price: 'R$ 120,00',
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
      gallery: ['assets/images/produto-borda-dourada.jpg'],
      variants: [
        { id: 'borda-areia', name: 'Areia', color: 'Areia', size: '45×70cm', price: 'R$ 120,00', stock: 5, image: 'assets/images/produto-borda-dourada.jpg' }
      ]
    },
    {
      title: 'Listrado Clássico',
      variant: 'Branco e terracota · 45×70cm',
      price: 'R$ 120,00',
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
      gallery: ['assets/images/produto-listrado-classico.jpg'],
      variants: [
        { id: 'listrado-branco', name: 'Branco', color: 'Branco', size: '45×70cm', price: 'R$ 120,00', stock: 7, image: 'assets/images/produto-listrado-classico.jpg' },
        { id: 'listrado-terracota', name: 'Terracota', color: 'Terracota', size: '45×70cm', price: 'R$ 120,00', stock: 4, image: 'assets/images/produto-listrado-classico.jpg' }
      ]
    },
    {
      title: 'Jacquard Ottomano',
      variant: 'Creme com padrão geométrico · 45×70cm',
      price: 'R$ 120,00',
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
      gallery: ['assets/images/produto-jacquard-ottomano.jpg'],
      variants: [
        { id: 'jacquard-creme', name: 'Creme', color: 'Creme', size: '45×70cm', price: 'R$ 120,00', stock: 0, image: 'assets/images/produto-jacquard-ottomano.jpg' }
      ]
    }
  ],
  kits: [
    {
      title: 'Cozinha Clássica',
      description: 'Três panos em tons neutros — branco natural, areia e linho — para combinar com qualquer cozinha.',
      price: 'R$ 230,00',
      tag: 'Kit · 3 peças',
      label: 'Kit empilhado',
      small: '3 panos dobrados sobre bancada',
      image: 'assets/images/kit-cozinha-classica.jpg'
    },
    {
      title: 'Presente Especial',
      description: 'Quatro peças selecionadas em embalagem presente com caixa e cartão personalizado.',
      price: 'R$ 230,00',
      tag: 'Kit · 4 peças + embalagem',
      label: 'Kit presenteado',
      small: 'Caixa com fita e papel de seda',
      image: 'assets/images/kit-presente-especial.jpg'
    },
    {
      title: 'Mesa de Brunch',
      description: 'Seis panos combinados — dois de cada cor — para uma mesa generosa e elegante.',
      price: 'R$ 230,00',
      tag: 'Kit · 6 peças',
      label: 'Kit mesa posta',
      small: 'Panos em mesa bem decorada',
      image: 'assets/images/kit-mesa-brunch.jpg'
    },
    {
      title: 'Cozinha Gourmet',
      description: 'Mix de padrões e texturas para quem enxerga os panos de prato como peça de decoração.',
      price: 'R$ 230,00',
      tag: 'Kit · 5 peças',
      label: 'Kit decorativo',
      small: 'Panos em suporte alto — cozinha aberta',
      image: 'assets/images/kit-cozinha-gourmet.jpg'
    }
  ]
};
