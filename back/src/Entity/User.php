<?php

namespace App\Entity;

use App\Repository\UserRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;

#[ORM\Entity(repositoryClass: UserRepository::class)]
#[ORM\Table(name: '`user`')]
#[ORM\UniqueConstraint(name: 'UNIQ_IDENTIFIER_USERNAME', fields: ['username'])]
class User implements UserInterface, PasswordAuthenticatedUserInterface
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 30)]
    private ?string $username = null;

    /**
     * @var list<string> The user roles
     */
    #[ORM\Column]
    private array $roles = [];

    /**
     * @var string The hashed password
     */
    #[ORM\Column]
    private ?string $password = null;

    #[ORM\Column(length: 255)]
    private ?string $email = null;

    #[ORM\Column(type: Types::DATE_MUTABLE, nullable: true)]
    private ?\DateTime $birthdate = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $description = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $avatarUrl = null;

    #[ORM\Column(type: Types::DATE_IMMUTABLE)]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column]
    private ?bool $isOnline = null;

    /**
     * @var Collection<int, Character>
     */
    #[ORM\OneToMany(targetEntity: Character::class, mappedBy: 'owner')]
    private Collection $characters;

    /**
     * @var Collection<int, Story>
     */
    #[ORM\OneToMany(targetEntity: Story::class, mappedBy: 'author')]
    private Collection $authoredStories;

    /**
     * @var Collection<int, StoryMember>
     */
    #[ORM\OneToMany(targetEntity: StoryMember::class, mappedBy: 'memberUser')]
    private Collection $storyMemberships;

    public function __construct()
    {
        $this->characters = new ArrayCollection();
        $this->authoredStories = new ArrayCollection();
        $this->storyMemberships = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getUsername(): ?string
    {
        return $this->username;
    }

    public function setUsername(string $username): static
    {
        $this->username = $username;

        return $this;
    }

    /**
     * A visual identifier that represents this user.
     *
     * @see UserInterface
     */
    public function getUserIdentifier(): string
    {
        return (string) $this->username;
    }

    /**
     * @see UserInterface
     */
    public function getRoles(): array
    {
        $roles = $this->roles;
        // guarantee every user at least has ROLE_USER
        $roles[] = 'ROLE_USER';

        return array_unique($roles);
    }

    /**
     * @param list<string> $roles
     */
    public function setRoles(array $roles): static
    {
        $this->roles = $roles;

        return $this;
    }

    /**
     * @see PasswordAuthenticatedUserInterface
     */
    public function getPassword(): ?string
    {
        return $this->password;
    }

    public function setPassword(string $password): static
    {
        $this->password = $password;

        return $this;
    }

    /**
     * Ensure the session doesn't contain actual password hashes by CRC32C-hashing them, as supported since Symfony 7.3.
     */
    public function __serialize(): array
    {
        $data = (array) $this;
        $data["\0" . self::class . "\0password"] = hash('crc32c', $this->password);

        return $data;
    }

    #[\Deprecated]
    public function eraseCredentials(): void
    {
        // @deprecated, to be removed when upgrading to Symfony 8
    }

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(string $email): static
    {
        $this->email = $email;

        return $this;
    }

    public function getBirthdate(): ?\DateTime
    {
        return $this->birthdate;
    }

    public function setBirthdate(?\DateTime $birthdate): static
    {
        $this->birthdate = $birthdate;

        return $this;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(?string $description): static
    {
        $this->description = $description;

        return $this;
    }

    public function getAvatarUrl(): ?string
    {
        return $this->avatarUrl;
    }

    public function setAvatarUrl(?string $avatarUrl): static
    {
        $this->avatarUrl = $avatarUrl;

        return $this;
    }

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function setCreatedAt(\DateTimeImmutable $createdAt): static
    {
        $this->createdAt = $createdAt;

        return $this;
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

    /**
     * @return Collection<int, Character>
     */
    public function getCharacters(): Collection
    {
        return $this->characters;
    }

    public function addCharacter(Character $character): static
    {
        if (!$this->characters->contains($character)) {
            $this->characters->add($character);
            $character->setOwner($this);
        }

        return $this;
    }

    public function removeCharacter(Character $character): static
    {
        if ($this->characters->removeElement($character)) {
            // set the owning side to null (unless already changed)
            if ($character->getOwner() === $this) {
                $character->setOwner(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, Story>
     */
    public function getAuthoredStories(): Collection
    {
        return $this->authoredStories;
    }

    public function addAuthoredStory(Story $authoredStory): static
    {
        if (!$this->authoredStories->contains($authoredStory)) {
            $this->authoredStories->add($authoredStory);
            $authoredStory->setAuthor($this);
        }

        return $this;
    }

    public function removeAuthoredStory(Story $authoredStory): static
    {
        if ($this->authoredStories->removeElement($authoredStory)) {
            // set the owning side to null (unless already changed)
            if ($authoredStory->getAuthor() === $this) {
                $authoredStory->setAuthor(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, StoryMember>
     */
    public function getStoryMemberships(): Collection
    {
        return $this->storyMemberships;
    }

    public function addStoryMembership(StoryMember $storyMembership): static
    {
        if (!$this->storyMemberships->contains($storyMembership)) {
            $this->storyMemberships->add($storyMembership);
            $storyMembership->setMemberUser($this);
        }

        return $this;
    }

    public function removeStoryMembership(StoryMember $storyMembership): static
    {
        if ($this->storyMemberships->removeElement($storyMembership)) {
            // set the owning side to null (unless already changed)
            if ($storyMembership->getMemberUser() === $this) {
                $storyMembership->setMemberUser(null);
            }
        }

        return $this;
    }
}
