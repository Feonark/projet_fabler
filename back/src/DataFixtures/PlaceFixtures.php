<?php

namespace App\DataFixtures;

use Sqids\Sqids;
use Faker\Factory;
use App\Entity\Place;
use App\Entity\Story;
use App\DataFixtures\ChatFixtures;
use App\DataFixtures\StoryFixtures;
use Doctrine\Persistence\ObjectManager;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Common\DataFixtures\DependentFixtureInterface;

class PlaceFixtures extends Fixture implements DependentFixtureInterface
{
  public function load(ObjectManager $manager): void
  {
    $faker = Factory::create('en_US');
    $sqids = new Sqids('', 6);
    $places = [];

    // Création de 40 places
    for ($i = 0; $i < 40; $i++) {
      $place = new Place();
      $place
        ->setTitle($faker->words(4, true))
        ->setDescription($faker->text(200))
        ->setPlaceImageUrl('placeDefault.jpg')
      ;

      // Assignation de Chat dans ChatFixtures

      // Story
      $story = $this->getReference('story_' . $faker->numberBetween(0, 9), Story::class);
      $place->setStory($story);

      $manager->persist($place);
      $places[] = $place;
    }

    // Je flush pour qu'ensuite je puisse avoir les IDs
    $manager->flush();

    // Une fois les ID récupérés, je génère le hashId
    foreach ($places as $place) {
      $place
        ->setHashId($sqids->encode([$place->getId()]));
    }

    $manager->flush();
  }

  public function getDependencies(): array
  {
    return [
      StoryFixtures::class
    ];
  }
}
