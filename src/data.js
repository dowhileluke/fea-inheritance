// data.js v1.0 -
// A massive script to build a list of playable characters and classes
// featured in Intelligent Systems' "Fire Emblem: Awakening"

// raw data taken from Serenes Forest <http://serenesforest.net/fe13/>

'use strict';

// The object that will eventually hold everything.
// Access it via the characters attribute. 
// e.g. `FEA.characters[2]` returns an object describing Frederick.
var FEA = window.FEA || {};

// The builder
(function(FEA, undefined) {
  // class object
  var classes = {};

  FEA.add_class = function(name, caps, skills) {
    // insert class into master object
    classes[name] = {
      name: name,
      caps: caps,
      skills: skills
    };
  };

  // class tree object
  var class_trees = {};

  FEA.build_class_tree = function(base, promotions, options) {
    // default object
    var tree = {
      base: classes[base],
      inheritable: true,
      branches: []
      // gender: undefined
    };

    // overwrite default values
    if (typeof(options) !== 'undefined') {
      for (var key in options) {
        tree[key] = options[key];
      };
    };

    // for each promotion, add the corresponding class object to the tree
    if (typeof(promotions) !== 'undefined') {
      for (var i=0; i<promotions.length; i++) {
        tree.branches.push(classes[promotions[i]]);
      };
    };

    // append current tree to master
    class_trees[base] = tree;
  };

  // characters array, visible to the outside
  FEA.characters = [];
  // characters object (for wiring up inheritance)
  var characters = {};

  FEA.add_character = function(name, generation, gender, mods, class_tree_list, alternates) {
    // default character object
    var character = {
      generation: generation,
      gender: gender,
      classes: []
    };

    // always add class trees
    for (var i=0; i<class_tree_list.length; i++) {
      character.classes.push(class_trees[class_tree_list[i]]);
    };

    // generation specific behavior
    if (generation === 1) {
      character.name = name;
      character.mods = mods;
      character.alternates = [];

      // force alternates argument to be an array
      alternates = alternates || [];

      // automatically add Cleric/Priest lines as alternates for each other
      for (var i=0; i<class_tree_list.length; i++) {
        var cur = class_tree_list[i];

        if (cur === 'Cleric') {
          alternates.push('Priest');
        } else if (cur === 'Priest') {
          alternates.push('Cleric');
        };
      };

      // add any alternates to the object 
      for (var i=0; i<alternates.length; i++) {
        character.alternates.push(class_trees[alternates[i]]);
      };
    } else { // gen 2
      // split the name variable into the parent!child parts
      // (ruby syntax would be nice here...)
      var names = name.split('!'),
          parent_name = names[0],
          child_name = names[1];

      // add child's name
      character.name = child_name;

      // create a bidirectional link between parent/child
      var parent = characters[parent_name];

      parent.child = character;
      character.parent = parent;
    };

    // add current character to both character objects
    FEA.characters.push(character);
    characters[name] = character;
  };
})(FEA);

// The data
(function(FEA, undefined) {
  /* Defines the classes. */
  // 1. Basic classes
  FEA.add_class('Archer',         [60, 26, 20, 29, 25, 30, 25, 21], ['Skill+2', 'Prescience']);
  FEA.add_class('Barbarian',      [60, 30, 20, 23, 27, 30, 22, 20], ['Despoil', 'Gamble']);
  FEA.add_class('Cavalier',       [60, 26, 20, 25, 25, 30, 26, 26], ['Discipline', 'Outdoor Fighter']);
  FEA.add_class('Cleric',         [60, 22, 25, 24, 25, 30, 22, 27], ['Miracle', 'Healtouch']);
  FEA.add_class('Dark Mage',      [60, 20, 27, 25, 25, 30, 25, 27], ['Hex', 'Anathema']);
  FEA.add_class('Fighter',        [60, 29, 20, 26, 25, 30, 25, 23], ['HP+5', 'Zeal']);
  FEA.add_class('Knight',         [60, 30, 20, 26, 23, 30, 30, 22], ['Defense+2', 'Indoor Fighter']);
  FEA.add_class('Lord F',         [60, 25, 20, 26, 28, 30, 25, 25], ['Dual Strike+', 'Charm']);
  FEA.add_class('Lord M',         [60, 25, 20, 26, 28, 30, 25, 25], ['Dual Strike+', 'Charm']);
  FEA.add_class('Mage',           [60, 20, 28, 27, 26, 30, 21, 25], ['Magic+2', 'Focus']);
  FEA.add_class('Mercenary',      [60, 26, 20, 28, 26, 30, 25, 23], ['Armsthrift', 'Patience']);
  FEA.add_class('Myrmidon',       [60, 24, 22, 27, 28, 30, 22, 24], ['Avoid+10', 'Vantage']);
  FEA.add_class('Pegasus Knight', [60, 24, 23, 28, 27, 30, 22, 25], ['Speed+2', 'Relief']);
  FEA.add_class('Priest',         [60, 22, 25, 24, 25, 30, 22, 27], ['Miracle', 'Healtouch']);
  FEA.add_class('Thief',          [60, 22, 20, 30, 28, 30, 21, 20], ['Locktouch', 'Movement+1']);
  FEA.add_class('Troubadour',     [60, 20, 26, 24, 26, 30, 20, 28], ['Resistance+2', 'Demoiselle']);
  FEA.add_class('Wyvern Rider',   [60, 28, 20, 24, 24, 30, 28, 20], ['Strength+2', 'Tantivy']);

  // 2. Promoted classes
  FEA.add_class('Assassin',      [80, 40, 30, 48, 46, 45, 31, 30], ['Lethality', 'Pass']);
  FEA.add_class('Berserker',     [80, 50, 30, 35, 44, 45, 34, 30], ['Wrath', 'Axefaire']);
  FEA.add_class('Bow Knight',    [80, 40, 30, 43, 41, 45, 35, 30], ['Rally Skill', 'Bowbreaker']);
  FEA.add_class('Dark Flier',    [80, 36, 42, 41, 42, 45, 32, 41], ['Rally Movement', 'Galeforce']);
  FEA.add_class('Dark Knight',   [80, 38, 41, 40, 40, 45, 42, 38], ['Slow Burn', 'Lifetaker']);
  FEA.add_class('Falcon Knight', [80, 38, 35, 45, 44, 45, 33, 40], ['Rally Speed', 'Lancefaire']);
  FEA.add_class('General',       [80, 50, 30, 41, 35, 45, 50, 35], ['Rally Defense', 'Pavise']);
  FEA.add_class('Great Knight',  [80, 48, 20, 34, 37, 45, 48, 30], ['Luna', 'Dual Guard+']);
  FEA.add_class('Great Lord F',  [80, 40, 30, 42, 44, 45, 40, 40], ['Aether', 'Rightful King']);
  FEA.add_class('Great Lord M',  [80, 43, 30, 40, 41, 45, 42, 40], ['Aether', 'Rightful King']);
  FEA.add_class('Griffon Rider', [80, 40, 30, 43, 41, 45, 40, 30], ['Deliverer', 'Lancebreaker']);
  FEA.add_class('Hero',          [80, 42, 30, 46, 42, 45, 40, 36], ['Sol', 'Axebreaker']);
  FEA.add_class('Paladin',       [80, 42, 30, 40, 40, 45, 42, 42], ['Defender', 'Aegis']);
  FEA.add_class('Sage',          [80, 30, 46, 43, 42, 45, 31, 40], ['Rally Magic', 'Tomefaire']);
  FEA.add_class('Sniper',        [80, 41, 30, 48, 40, 45, 40, 31], ['Hit+20', 'Bowfaire']);
  FEA.add_class('Sorcerer',      [80, 30, 44, 38, 40, 45, 41, 44], ['Vengeance', 'Tomebreaker']);
  FEA.add_class('Swordmaster',   [80, 38, 34, 44, 46, 45, 33, 38], ['Astra', 'Swordfaire']);
  FEA.add_class('Trickster',     [80, 35, 38, 45, 43, 45, 30, 40], ['Lucky 7', 'Acrobat']);
  FEA.add_class('Valkyrie',      [80, 30, 42, 38, 43, 45, 30, 45], ['Rally Resistance', 'Dual Support+']);
  FEA.add_class('War Cleric',    [80, 40, 40, 38, 41, 45, 38, 43], ['Rally Luck', 'Renewal']);
  FEA.add_class('War Monk',      [80, 40, 40, 38, 41, 45, 38, 43], ['Rally Luck', 'Renewal']);
  FEA.add_class('Warrior',       [80, 48, 30, 42, 40, 45, 40, 35], ['Rally Strength', 'Counter']);
  FEA.add_class('Wyvern Lord',   [80, 46, 30, 38, 38, 45, 46, 30], ['Quick Burn', 'Swordbreaker']);

  // 3. Special classes
  FEA.add_class('Dancer',   [80, 30, 30, 40, 40, 45, 30, 30], ['Luck+4', 'Special Dance']);
  FEA.add_class('Manakete', [80, 40, 35, 35, 35, 45, 40, 40], ['Odd Rhythm', 'Wyrmsbane']);
  FEA.add_class('Taguel',   [80, 35, 30, 40, 40, 45, 35, 30], ['Even Rhythm', 'Beastbane']);
  FEA.add_class('Villager', [60, 20, 20, 20, 20, 30, 20, 20], ['Aptitude', 'Underdog']);

  /* Defines the class trees. */
  FEA.build_class_tree('Archer', ['Sniper', 'Bow Knight']);
  FEA.build_class_tree('Barbarian', ['Berserker', 'Warrior'], {gender: 'm'});
  FEA.build_class_tree('Cavalier', ['Paladin', 'Great Knight']);
  FEA.build_class_tree('Cleric', ['War Cleric', 'Sage'], {gender: 'f'});
  FEA.build_class_tree('Dancer', [], {inheritable: false});
  FEA.build_class_tree('Dark Mage', ['Sorcerer', 'Dark Knight']);
  FEA.build_class_tree('Fighter', ['Warrior', 'Hero'], {gender: 'm'});
  FEA.build_class_tree('Knight', ['General', 'Great Knight']);
  FEA.build_class_tree('Lord F', ['Great Lord F'], {inheritable: false});
  FEA.build_class_tree('Lord M', ['Great Lord M'], {inheritable: false});
  FEA.build_class_tree('Mage', ['Sage', 'Dark Knight']);
  FEA.build_class_tree('Manakete', []);
  FEA.build_class_tree('Mercenary', ['Hero', 'Bow Knight']);
  FEA.build_class_tree('Myrmidon', ['Swordmaster', 'Assassin']);
  FEA.build_class_tree('Pegasus Knight', ['Falcon Knight', 'Dark Flier'], {gender: 'f'});
  FEA.build_class_tree('Priest', ['War Monk', 'Sage'], {gender: 'm'});
  FEA.build_class_tree('Taguel', []);
  FEA.build_class_tree('Thief', ['Assassin', 'Trickster']);
  FEA.build_class_tree('Troubadour', ['Valkyrie', 'War Cleric'], {gender: 'f'});
  FEA.build_class_tree('Villager', [], {gender: 'm'});
  FEA.build_class_tree('Wyvern Rider', ['Wyvern Lord', 'Griffon Rider']);

  /* Defines the characters. */
  // 1. First generation
  FEA.add_character('Chrom',     1, 'm', [1, 0, 1, 1, 1, -1, -1],   ['Lord M', 'Cavalier', 'Archer']);
  FEA.add_character('Lissa',     1, 'f', [-2, 2, -1, 0, 2, -1, 1],  ['Cleric', 'Pegasus Knight', 'Troubadour'], ['Barbarian']);
  FEA.add_character('Frederick', 1, 'm', [2, -2, 2, -2, 0, 2, 0],   ['Cavalier', 'Knight', 'Wyvern Rider']);
  FEA.add_character('Sully',     1, 'f', [-1, -1, 2, 2, 0, -1, 0],  ['Cavalier', 'Myrmidon', 'Wyvern Rider']);
  FEA.add_character('Virion',    1, 'm', [0, 0, 2, 2, -1, -2, 0],   ['Archer', 'Mage', 'Wyvern Rider']);
  FEA.add_character('Stahl',     1, 'm', [2, -1, 1, 0, -2, 2, -1],  ['Cavalier', 'Myrmidon', 'Archer']);
  FEA.add_character('Vaike',     1, 'm', [3, -2, 1, 1, -1, 0, -2],  ['Fighter', 'Thief', 'Barbarian'], ['Knight', 'Mercenary']);
  FEA.add_character('Miriel',    1, 'f', [-2, 3, 1, 1, 0, -2, 0],   ['Mage', 'Troubadour', 'Dark Mage'], ['Barbarian']);
  FEA.add_character('Sumia',     1, 'f', [-2, 0, 2, 3, 0, -2, 1],   ['Pegasus Knight', 'Knight', 'Cleric']);
  FEA.add_character('Kellam',    1, 'm', [1, 0, 1, -2, -2, 3, 0],   ['Knight', 'Thief', 'Priest']);
  FEA.add_character('Donnel',    1, 'm', [1, -1, -1, -1, 3, 1, -1], ['Villager', 'Fighter', 'Mercenary'], ['Pegasus Knight', 'Troubadour']);
  FEA.add_character('Lon\'qu',   1, 'm', [0, 0, 3, 3, 0, -2, -2],   ['Myrmidon', 'Thief', 'Wyvern Rider']);
  FEA.add_character('Ricken',    1, 'm', [-1, 2, 0, 0, 1, -1, 0],   ['Mage', 'Cavalier', 'Archer']);
  FEA.add_character('Maribelle', 1, 'f', [-3, 2, 1, 0, 3, -3, 2],   ['Troubadour', 'Pegasus Knight', 'Mage'], ['Cavalier']);
  FEA.add_character('Panne',     1, 'f', [2, -1, 2, 3, -1, 1, -1],  ['Taguel', 'Thief', 'Wyvern Rider'], ['Barbarian']);
  FEA.add_character('Gaius',     1, 'm', [1, -1, 2, 2, -2, -1, 0],  ['Thief', 'Myrmidon', 'Fighter'], ['Pegasus Knight']);
  FEA.add_character('Cordelia',  1, 'f', [1, -1, 2, 2, -1, 0, -1],  ['Pegasus Knight', 'Mercenary', 'Dark Mage']);
  FEA.add_character('Gregor',    1, 'm', [2, -1, 2, 0, -1, 1, -2],  ['Mercenary', 'Myrmidon', 'Barbarian'], ['Troubadour']);
  FEA.add_character('Nowi',      1, 'f', [1, 1, -1, -2, 1, 3, 2],   ['Manakete', 'Mage', 'Wyvern Rider']);
  FEA.add_character('Libra',     1, 'm', [0, 1, 1, 0, -1, 0, 1],    ['Priest', 'Mage', 'Dark Mage']);
  FEA.add_character('Tharja',    1, 'f', [0, 3, -1, 1, -3, 1, 0],   ['Dark Mage', 'Knight', 'Archer']);
  FEA.add_character('Olivia',    1, 'f', [0, 0, 1, 1, 0, -1, -1],   ['Dancer', 'Myrmidon', 'Pegasus Knight'], ['Barbarian']);
  FEA.add_character('Cherche',   1, 'f', [3, 0, -1, -1, 0, 2, -2],  ['Wyvern Rider', 'Troubadour', 'Cleric'], ['Fighter']);
  FEA.add_character('Henry',     1, 'm', [1, 1, 2, 0, -2, 1, -1],   ['Dark Mage', 'Thief', 'Barbarian'], ['Troubadour']);

  // 2. Second generation
  // Note: mods will be filled in automatically
  FEA.add_character('Chrom!Lucina',    2, 'f', [], ['Lord F']);
  FEA.add_character('Lissa!Owain',     2, 'm', [], ['Myrmidon']);
  FEA.add_character('Olivia!Inigo',    2, 'm', [], ['Mercenary']);
  FEA.add_character('Maribelle!Brady', 2, 'm', [], ['Priest']);
  FEA.add_character('Sully!Kjelle',    2, 'f', [], ['Knight']);
  FEA.add_character('Sumia!Cynthia',   2, 'f', [], ['Pegasus Knight']);
  FEA.add_character('Cordelia!Severa', 2, 'f', [], ['Mercenary']);
  FEA.add_character('Cherche!Gerome',  2, 'm', [], ['Wyvern Rider']);
  FEA.add_character('Panne!Yarne',     2, 'm', [], ['Taguel']);
  FEA.add_character('Miriel!Laurent',  2, 'm', [], ['Mage']);
  FEA.add_character('Tharja!Noire',    2, 'f', [], ['Archer']);
  FEA.add_character('Nowi!Nah',        2, 'f', [], ['Manakete']);
})(FEA);
