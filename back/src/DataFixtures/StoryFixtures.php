<?php

namespace App\DataFixtures;

use Sqids\Sqids;
use Faker\Factory;
use App\Enum\Genre;
use App\Entity\User;
use App\Entity\Story;
use App\Enum\Access;
use App\Enum\Audience;
use App\Enum\Language;
use App\Entity\Character;
use App\DataFixtures\UserFixtures;
use App\DataFixtures\CharacterFixtures;
use Doctrine\Persistence\ObjectManager;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Common\DataFixtures\DependentFixtureInterface;

class StoryFixtures extends Fixture implements DependentFixtureInterface
{
  public function load(ObjectManager $manager): void
  {
    $faker = Factory::create('en_US');
    $sqids = new Sqids('', 6);
    $genres = Genre::cases();
    $audiences = Audience::cases();
    $accesses = Access::cases();
    $languages = Language::cases();

    $stories = [];

    // Création de 10 histoires
    for ($i = 0; $i < 10; $i++) {
      $story = new Story();
      $story
        ->setTitle($faker->sentence(3))
        ->setDescription($faker->text(1000))
        ->setBannerImageUrl('defaultBanner.jpg')
        ->setIsPublic($faker->boolean(70))
        ->setGenreType($faker->randomElement($genres))
        ->setAudienceType($faker->randomElement($audiences))
        ->setAccessType($faker->randomElement($accesses))
        ->setLanguageType($faker->randomElement($languages));

      // Assignation de Characters
      $characterCount = $faker->numberBetween(3, 7);
      $usedIndexes = [];

      for ($j = 0; $j < $characterCount; $j++) {
        do {
          $index = $faker->numberBetween(0, 29);
        } while (in_array($index, $usedIndexes));
        $usedIndexes[] = $index;

        $character = $this->getReference('character_' . $index, Character::class);

        $story->addCharacter($character);

        // Relation inverse (pas obligatoire si correctement gérée en cascade, mais ici on l'assure à la main)
        if (!$character->getUsedInStories()->contains($story)) {
          $character->addUsedInStory($story);
        }

        $manager->persist($character); // Important !
      }

      // Assignation de l’auteur
      $author = $this->getReference('user_' . $faker->numberBetween(0, 9), User::class);
      $story->setAuthor($author);

      $manager->persist($story);
      $stories[] = $story;
      $this->addReference('story_' . $i, $story);
    }

    // Flush une première fois pour récupérer les IDs
    $manager->flush();

    // Ajout des hashIds après création
    foreach ($stories as $story) {
      $story->setHashId($sqids->encode([$story->getId()]));
    }

    // Flush final avec les hashIds mis à jour
    $manager->flush();
  }

  public function getDependencies(): array
  {
    return [
      CharacterFixtures::class,
      UserFixtures::class,
    ];
  }
}
