<?php

namespace App\DataFixtures;

use Sqids\Sqids;
use Faker\Factory;
use App\Entity\User;
use App\Entity\Character;
use App\DataFixtures\UserFixtures;
use App\DataFixtures\StoryFixtures;
use App\DataFixtures\MessageFixtures;
use Doctrine\Persistence\ObjectManager;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Common\DataFixtures\DependentFixtureInterface;

class CharacterFixtures extends Fixture implements DependentFixtureInterface
{
  public function load(ObjectManager $manager): void
  {
    $faker = Factory::create('en_US');
    $sqids = new Sqids('', 6);

    // Création de 30 characters
    for ($i = 0; $i < 30; $i++) {
      $character = new Character();
      $character
        ->setName($faker->userName())
        ->setTitle($faker->words(3, true))
        ->setBio($faker->text(2000))
        ->setPortraitUrl('portraitDefault.jpg')
        ->setAvatarUrl('aviDefault.jpg')
      ;

      // Assignation d'un owner
      $owner = $this->getReference('user_' . $faker->numberBetween(0, 9), User::class);
      $character->setOwner($owner);

      // Assignation de stories dans StoryFixtures

      // Assignation de messages faite dans MessageFixtures


      $manager->persist($character);
      $characters[] = $character;

      $this->addReference('character_' . $i, $character);
    }

    // Je flush pour qu'ensuite je puisse avoir les IDs
    $manager->flush();

    // Une fois les ID récupérés, je génère le hashId
    foreach ($characters as $character) {
      $character
        ->setHashId($sqids->encode([$character->getId()]));
    }

    $manager->flush();
  }

  public function getDependencies(): array
  {
    return [
      UserFixtures::class,
    ];
  }
}
