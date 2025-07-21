<?php

namespace App\Entity;

use App\Repository\MemberChatStatusRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: MemberChatStatusRepository::class)]
class MemberChatStatus
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column]
    private ?bool $isOnline = null;

    #[ORM\Column]
    private ?bool $isWriting = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function isOnline(): ?bool
    {
        return $this->isOnline;
    }

    public function setIsOnline(bool $isOnline): static
    {
        $this->isOnline = $isOnline;

        return $this;
    }

    public function isWriting(): ?bool
    {
        return $this->isWriting;
    }

    public function setIsWriting(bool $isWriting): static
    {
        $this->isWriting = $isWriting;

        return $this;
    }
}
