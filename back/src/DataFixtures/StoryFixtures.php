<?php

namespace App\DataFixtures;

use Sqids\Sqids;
use Faker\Factory;
use App\Enum\Genre;
use App\Entity\Chat;
use App\Entity\User;
use App\Enum\Access;
use App\Entity\Story;
use App\Enum\Audience;
use App\Enum\Language;
use App\Entity\Character;
use App\DataFixtures\ChatFixtures;
use App\DataFixtures\UserFixtures;
use App\DataFixtures\PlaceFixtures;
use App\DataFixtures\CharacterFixtures;
use Doctrine\Persistence\ObjectManager;
use App\DataFixtures\StoryMemberFixtures;
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
        ->setLanguageType($faker->randomElement($languages))
      ;

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
      }

      // Assignation de Author
      $author = $this->getReference('user_' . $faker->numberBetween(0, 9), User::class);
      $story->setAuthor($author);

      // Assignation de Members dans StoryMemberFixtures

      // Assignation de Chat dans ChatFixtures

      // Assignation de Places dans PlaceFixtures

      $manager->persist($story);
      $stories[] = $story;
      $this->addReference('story_' . $i, $story);
    }

    // Je flush pour qu'ensuite je puisse avoir les IDs
    $manager->flush();

    // Une fois les ID récupérés, je génère le hashId
    foreach ($stories as $story) {
      $story
        ->setHashId($sqids->encode([$story->getId()]));
    }

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
