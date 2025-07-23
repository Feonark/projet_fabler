<?php

namespace App\DataFixtures;

use DateTime;
use Faker\Factory;
use App\Entity\User;
use App\DataFixtures\StoryFixtures;
use App\DataFixtures\CharacterFixtures;
use Doctrine\Persistence\ObjectManager;
use App\DataFixtures\StoryMemberFixtures;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Common\DataFixtures\DependentFixtureInterface;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class UserFixtures extends Fixture
{
  public function __construct(
    private readonly UserPasswordHasherInterface $hasher
  ) {}

  public function load(ObjectManager $manager): void
  {
    $faker = Factory::create('en_US');

    // Création d'un user supprimé
    $deletedUser = new User();
    $deletedUser
      ->setUsername('[Deleted user]')
      ->setRoles(['ROLE_DELETED'])
      ->setPassword($this->hasher->hashPassword($deletedUser, 'deletedUser'))
      ->setEmail('deleted@user.com')
      ->setBirthdate(new \DateTime('2000-01-01'))
      ->setDescription('[Deleted user description]')
      ->setAvatarUrl('defaultAvi.jpg')
      ->setCreatedAt(new \DateTimeImmutable('today'))
      ->setIsOnline(false)
    ;
    $manager->persist($deletedUser);
    $manager->flush();

    // Création de 10 users
    for ($i = 0; $i < 10; $i++) {
      $user = new User();
      $user
        ->setUsername($faker->userName())
        ->setRoles(['ROLE_USER'])
        ->setPassword($this->hasher->hashPassword($user, $faker->password(8, 50)))
        ->setEmail($faker->email())
        ->setBirthdate($faker->dateTime())
        ->setDescription($faker->text(1000))
        ->setAvatarUrl('defaultAvi.jpg')
        ->setCreatedAt(\DateTimeImmutable::createFromMutable($faker->dateTime()))
        ->setIsOnline($faker->boolean(50))

        // Assignation de characters faite dans CharacterFixtures
        // Assignation de stories faite dans StoryFixtures
        // Assignation de storymembers faite dans StoryMembers
      ;

      $manager->persist($user);
      $this->addReference('user_' . $i, $user);
    }

    $manager->flush();
  }
}
