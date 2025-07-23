<?php

namespace App\DataFixtures;

use Faker\Factory;
use App\Entity\MemberChatStatus;
use Doctrine\Persistence\ObjectManager;
use Doctrine\Bundle\FixturesBundle\Fixture;

class MemberChatStatusFixtures extends Fixture
{
    public function load(ObjectManager $manager): void
    {
        $faker = Factory::create('en_US');

        // Création de 40 MemberChatStatus
        for ($i = 0; $i < 40; $i++) {
            $memberChatStatus = new MemberChatStatus();
            $memberChatStatus
                ->setIsOnline($faker->boolean(30))
                ->setIsWriting(false)
            ;

            $manager->persist($memberChatStatus);
            $this->addReference('memberChatStatus_' . $i, $memberChatStatus);
        }
        $manager->flush();
    }
}
