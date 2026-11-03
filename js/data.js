/* ------------------------------------------------------------------
   Conteúdo editável do site Impacttto.
   Tudo que aparece no site (artistas, estilos, portfólio, contato)
   está aqui. Os textos vêm do perfil @impacttto_ e devem ser
   confirmados com o estúdio (ver README.md).
------------------------------------------------------------------- */
(function () {
  'use strict';

  var IMG = 'assets/img/';

  window.IMPACTTTO = Object.freeze({
    config: {
      instagram: 'impacttto_',
      // Somente dígitos, com DDI+DDD. Vazio = todos os botões de WhatsApp ficam escondidos.
      whatsapp: '5511947873805',
      whatsappLabel: '(11) 94787-3805',
      address: 'Av. da Liberdade, 65 – sala 1002 – Liberdade, São Paulo – SP',
      mapsQuery: 'Av. da Liberdade, 65, Liberdade, São Paulo - SP'
    },

    styles: [
      { id: 'geek', label: 'Geek / Anime' },
      { id: 'cyber', label: 'Cyber' },
      { id: 'cover', label: 'Coberturas e reformas' },
      { id: 'realismo', label: 'Realismo preto e cinza' },
      { id: 'blackwork', label: 'Blackwork' },
      { id: 'aquarela', label: 'Aquarela' },
      { id: 'cartoon', label: 'Cartoon / Whip shading' },
      { id: 'pixel', label: 'Pixel art e glitter' },
      { id: 'fino', label: 'Traço fino e delicado' },
      { id: 'mini', label: 'Mini realismo' },
      { id: 'pv', label: 'Preto e vermelho' },
      { id: 'colorido', label: 'Colorido' }
    ],

    artists: [
      { id: 'opalaoro', name: 'Opalaoro', handle: 'opalaoro', accent: '#ff7a1a',
        blurb: 'Universo cyber e geek, com traços únicos e cheios de atitude.',
        tags: ['cyber', 'geek'] },
      { id: 'brunasafeco', name: 'Bruna Safeco', handle: 'brunasafeco.tattoo', accent: '#ff4fa3',
        blurb: 'Especialista em coberturas. Manda muito nas coloridas, preto e cinza, glitter e mini realismo.',
        tags: ['cover', 'colorido', 'realismo', 'pixel', 'mini'] },
      { id: 'marcio', name: 'Márcio', sub: 'Meu Tatuador', handle: 'marciomeutatuador', accent: '#4fb2ff',
        blurb: 'Universo Star Wars, coberturas e reformas.',
        tags: ['geek', 'cover'] },
      { id: 'lopes', name: 'Gabriel Lopes', handle: 'lopesgabriel.tattoo', accent: '#ff3b3b',
        blurb: 'Traços finos e realismo preto e cinza, unindo técnica e sensibilidade.',
        tags: ['fino', 'realismo'] },
      { id: 'dani', name: 'Dani', handle: 'danitattooer', accent: '#5aa7ff',
        blurb: 'Traços delicados e autorais, tons de azul com leveza e sensibilidade.',
        tags: ['fino'] },
      { id: 'fab', name: 'Fab', handle: 'fab.ilustattoo', accent: '#b57cff',
        blurb: 'Arte autoral em aquarela, brincando entre cores vibrantes e o equilíbrio do preto e branco.',
        tags: ['aquarela', 'colorido'] },
      { id: 'torrecilha', name: 'Torrecilha', handle: 'torrecilha.ink', accent: '#ffd23f',
        blurb: 'Arte autoral cheia de cor. Whip shading e estilo cartoon.',
        tags: ['cartoon', 'colorido'] },
      { id: 'lola', name: 'Lola', handle: 'lol4.ink', accent: '#ff7ad9',
        blurb: 'Do traço fino ao colorido vibrante. Mistura estilos com liberdade, brilho, glitter e pixel art.',
        tags: ['fino', 'colorido', 'pixel'] },
      { id: 'rody', name: 'Rody', handle: 'rody.tattoos', accent: '#3ee0b0',
        blurb: 'Tattoos inspiradas no universo geek e dos animes, cheias de cor e personalidade.',
        tags: ['geek', 'colorido'] },
      { id: 'jotape', name: 'JP', sub: 'Jotape', handle: 'jotape_tatuador', accent: '#ff4a4a',
        blurb: 'Referências geek e blackwork. Tatuagens exclusivas em preto e vermelho, marcantes e cheias de identidade.',
        tags: ['geek', 'blackwork', 'pv'] }
    ],

    // Fotos do portfólio. As imagens vieram de capturas do Instagram dos artistas;
    // trocar pelos arquivos originais em alta resolução quando o estúdio enviar.
    work: [
      { src: IMG + 'work/lirios.webp', tall: true, artist: 'marcio', styles: ['fino'], alt: 'Costas com lírios em traço fino preto' },
      { src: IMG + 'artists/opalaoro-tattoo.webp', artist: 'opalaoro', styles: ['cyber', 'geek'], alt: 'Tatuagem de personagem de anime em tons de laranja, estilo cyber' },
      { src: IMG + 'work/mimikyu.webp', tall: true, artist: 'opalaoro', styles: ['geek', 'colorido'], alt: 'Tatuagem colorida de personagem geek na panturrilha' },
      { src: IMG + 'artists/lopes-tattoo.webp', artist: 'lopes', styles: ['realismo', 'pv'], alt: 'Dragão em preto e cinza com flores vermelhas nas costas' },
      { src: IMG + 'artists/marcio-tattoo.webp', artist: 'marcio', styles: ['geek', 'colorido'], alt: 'Castelo em azul vibrante tatuado no braço' },
      { src: IMG + 'work/caduceu.webp', tall: true, artist: 'brunasafeco', styles: ['colorido', 'mini'], alt: 'Caduceu dourado com flores azuis na perna' },
      { src: IMG + 'artists/torrecilha-tattoo.webp', artist: 'torrecilha', styles: ['cartoon', 'colorido'], alt: 'Personagem amarelo em estilo cartoon' },
      { src: IMG + 'artists/fab-tattoo.webp', artist: 'fab', styles: ['aquarela', 'geek', 'colorido'], alt: 'Guerreira dourada em aquarela no ombro' },
      { src: IMG + 'artists/jotape-tattoo.webp', artist: 'jotape', styles: ['blackwork', 'pv', 'geek'], alt: 'Criatura mitológica em blackwork com detalhes em vermelho' },
      { src: IMG + 'work/gato.webp', tall: true, artist: 'dani', styles: ['fino', 'pv'], alt: 'Gato em traço fino com peixe vermelho no tornozelo' },
      { src: IMG + 'artists/brunasafeco-tattoo.webp', artist: 'brunasafeco', styles: ['colorido', 'pixel', 'geek'], alt: 'Tatuagem colorida com brilho em estilo glitter' },
      { src: IMG + 'artists/lola-tattoo.webp', artist: 'lola', styles: ['cartoon', 'colorido', 'geek'], alt: 'Personagem de anime em estilo cartoon colorido' },
      { src: IMG + 'artists/rody-tattoo.webp', artist: 'rody', styles: ['geek', 'blackwork'], alt: 'Personagem de anime em preto e cinza com nuvens' },
      { src: IMG + 'artists/dani-tattoo.webp', artist: 'dani', styles: ['fino'], alt: 'Desenho delicado em tons de azul no antebraço' }
    ]
  });
})();
