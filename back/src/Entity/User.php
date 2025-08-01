<?php

namespace App\Entity;

use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\Post;
use Doctrine\DBAL\Types\Types;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Delete;
use Doctrine\ORM\Mapping as ORM;
use App\State\UserStateProcessor;
use App\Repository\UserRepository;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\GetCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\Common\Collections\ArrayCollection;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Bridge\Doctrine\Validator\Constraints\UniqueEntity;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;

#[UniqueEntity(fields: ['username'], message: 'This username is already taken.')]
#[UniqueEntity(fields: ['email'], message: 'This email is already used.')]
#[ORM\Entity(repositoryClass: UserRepository::class)]
#[ORM\Table(name: '`user`')]
#[ORM\UniqueConstraint(name: 'UNIQ_IDENTIFIER_USERNAME', fields: ['username'])]
#[ApiResource(
    normalizationContext: ['groups' => ['read']],
    denormalizationContext: ['groups' => ['write']],
    operations: [
        new Get(),
        new GetCollection(security: "is_granted('ROLE_ADMIN')"),
        new Post(
            processor: UserStateProcessor::class,
            validationContext: ['groups' => ['create']],
            denormalizationContext: ['groups' => ['create_write']]
        ),
        new Patch(
            processor: UserStateProcessor::class,
            security: "is_granted('POST_EDIT', object)",
            validationContext: ['groups' => ['edit']],
            denormalizationContext: ['groups' => ['edit_write']]
        ),
        new Delete(security: "is_granted('POST_DELETE', object)")
    ]
)]
class User implements UserInterface, PasswordAuthenticatedUserInterface
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups('read')]
    private ?int $id = null;

    #[ORM\Column(length: 30, unique: true)]
    #[Assert\NotBlank(
        message: 'The username cannot be blank.',
        groups: ['create', 'edit']
    )]
    #[Assert\NotNull(
        message: 'The username cannot be null.',
        groups: ['create', 'edit']
    )]
    #[Assert\Length(
        min: 3,
        max: 30,
        minMessage: 'Your username must be at least {{ limit }} characters long',
        maxMessage: 'Your username cannot be longer than {{ limit }} characters',
        groups: ['create', 'edit']
    )]
    #[Assert\Regex(
        pattern: '/^[a-zA-Z0-9]+$/',
        message: 'Your username can only contain letters and numbers (no spaces, dashes or special characters).',
        groups: ['create', 'edit']
    )]
    #[Groups(['read', 'create_write', 'edit_write'])]
    private ?string $username = null;

    /**
     * @var list<string> The user roles
     */
    #[ORM\Column]
    private array $roles = [];

    #[ORM\Column]
    private ?string $password = null;

    #[Assert\NotBlank(
        message: 'The password cannot be blank.',
        groups: ['create']
    )]
    #[Assert\NotNull(
        message: 'The password cannot be null.',
        groups: ['create']
    )]
    #[Assert\Length(
        min: 8,
        max: 50,
        minMessage: 'Your password must be at least {{ limit }} characters long.',
        maxMessage: 'Your password cannot be longer than {{ limit }} characters.',
        groups: ['create']
    )]
    #[Assert\Regex(
        pattern: '/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/',
        message: 'Your password must contain at least one uppercase letter, one lowercase letter, and one number.',
        groups: ['create']
    )]
    #[Assert\Regex(
        pattern: '/<[^>]*>/',
        match: false,
        message: 'HTML tags are not allowed in the password.',
        groups: ['create']
    )]
    #[Groups('create_write')]
    private ?string $plainPassword = null;

    #[ORM\Column(length: 255, unique: true)]
    #[Assert\NotBlank(
        message: 'Email cannot be blank.',
        groups: ['create', 'edit']
    )]
    #[Assert\Length(
        max: 255,
        maxMessage: 'Email cannot be longer than {{ limit }} characters.',
        groups: ['create', 'edit']
    )]
    #[Assert\Email(
        message: 'The email {{ value }} is not a valid email.',
        groups: ['create', 'edit']
    )]
    #[Groups(['read', 'create_write', 'edit_write'])]
    private ?string $email = null;

    #[ORM\Column(type: Types::DATE_MUTABLE, nullable: true)]
    #[Assert\LessThan(
        'today',
        message: 'Birthdate must be in the past.',
        groups: ['create', 'edit']
    )]
    #[Assert\LessThan(
        '-13 years',
        message: 'You must be at least 13 years old.',
        groups: ['create', 'edit']
    )]
    #[Assert\GreaterThan(
        '-120 years',
        message: 'Please enter a valid birthdate.',
        groups: ['create', 'edit']
    )]
    #[Groups(['read', 'create_write', 'edit_write'])]
    private ?\DateTime $birthdate = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Assert\Length(
        max: 1000,
        maxMessage: 'Your bio cannot be longer than {{ limit }} characters.',
        groups: ['create', 'edit']
    )]
    #[Assert\Regex(
        pattern: '/<[^>]*>/',
        match: false,
        message: 'HTML tags are not allowed in your bio.',
        groups: ['create', 'edit']
    )]
    #[Assert\Regex(
        pattern: '/\S/',
        message: 'Your description cannot be empty or contain only spaces.',
        groups: ['create', 'edit']
    )]
    #[Groups(['read', 'create_write', 'edit_write'])]
    private ?string $description = null;

    #[Assert\Length(
        max: 255,
        groups: ['create', 'edit']
    )]
    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['read', 'create_write', 'edit_write'])]
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

    public function getPlainPassword(): ?string
    {
        return $this->plainPassword;
    }

    public function setPlainPassword(?string $plainPassword): static
    {
        $this->plainPassword = $plainPassword;

        return $this;
    }
}
